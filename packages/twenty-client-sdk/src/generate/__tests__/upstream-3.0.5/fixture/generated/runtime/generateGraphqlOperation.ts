// @ts-nocheck
import type { LinkedField, LinkedType } from './types'

export interface Args {
    [arg: string]: any | undefined
}

export interface Fields {
    [field: string]: Request
}

export type Request = boolean | number | Fields

export interface Variables {
    [name: string]: {
        value: any
        typing: [LinkedType, string]
    }
}

export interface Context {
    root: LinkedType
    varCounter: number
    variables: Variables
    fragmentCounter: number
    fragments: string[]
}

export interface GraphqlOperation {
    query: string
    variables?: { [name: string]: any }
    operationName?: string
}

const parseRequest = (
    request: Request | undefined,
    ctx: Context,
    path: string[],
): string => {
    if (typeof request === 'object' && '__args' in request) {
        const args: any = request.__args
        let fields: Request | undefined = { ...request }
        delete fields.__args
        const argNames = Object.keys(args)

        if (argNames.length === 0) {
            return parseRequest(fields, ctx, path)
        }

        const field = getFieldFromPath(ctx.root, path)

        const argStrings = argNames.map((argName) => {
            ctx.varCounter++
            const varName = `v${ctx.varCounter}`

            const typing = field.args && field.args[argName] // typeMap used here, .args

            if (!typing) {
                throw new Error(
                    `no typing defined for argument \`${argName}\` in path \`${path.join(
                        '.',
                    )}\``,
                )
            }

            ctx.variables[varName] = {
                value: args[argName],
                typing,
            }

            return `${argName}:$${varName}`
        })
        return `(${argStrings})${parseRequest(fields, ctx, path)}`
    } else if (typeof request === 'object' && Object.keys(request).length > 0) {
        const fields = request
        const fieldNames = Object.keys(fields).filter((k) => Boolean(fields[k]))

        if (fieldNames.length === 0) {
            throw new Error(
                `field selection should not be empty: ${path.join('.')}`,
            )
        }

        const type =
            path.length > 0 ? getFieldFromPath(ctx.root, path).type : ctx.root
        const scalarFields = type.scalar

        let scalarFieldsFragment: string | undefined

        if (fieldNames.includes('__scalar')) {
            const falsyFieldNames = new Set(
                Object.keys(fields).filter((k) => !Boolean(fields[k])),
            )
            if (scalarFields?.length) {
                ctx.fragmentCounter++
                scalarFieldsFragment = `f${ctx.fragmentCounter}`

                ctx.fragments.push(
                    `fragment ${scalarFieldsFragment} on ${
                        type.name
                    }{${scalarFields
                        .filter((f) => !falsyFieldNames.has(f))
                        .join(',')}}`,
                )
            }
        }

        const fieldsSelection = fieldNames
            .filter((f) => !['__scalar', '__name'].includes(f))
            .map((f) => {
                const parsed = parseRequest(fields[f], ctx, [...path, f])

                if (f.startsWith('on_')) {
                    ctx.fragmentCounter++
                    const implementationFragment = `f${ctx.fragmentCounter}`

                    const typeMatch = f.match(/^on_(.+)/)

                    if (!typeMatch || !typeMatch[1])
                        throw new Error('match failed')

                    ctx.fragments.push(
                        `fragment ${implementationFragment} on ${typeMatch[1]}${parsed}`,
                    )

                    return `...${implementationFragment}`
                } else {
                    return `${f}${parsed}`
                }
            })
            .concat(scalarFieldsFragment ? [`...${scalarFieldsFragment}`] : [])
            .join(',')

        return `{${fieldsSelection}}`
    } else {
        return ''
    }
}

export const generateGraphqlOperation = (
    operation: 'query' | 'mutation' | 'subscription',
    root: LinkedType,
    fields?: Fields,
): GraphqlOperation => {
    const ctx: Context = {
        root: root,
        varCounter: 0,
        variables: {},
        fragmentCounter: 0,
        fragments: [],
    }
    const result = parseRequest(fields, ctx, [])

    const varNames = Object.keys(ctx.variables)

    const varsString =
        varNames.length > 0
            ? `(${varNames.map((v) => {
                  const variableType = ctx.variables[v].typing[1]
                  return `$${v}:${variableType}`
              })})`
            : ''

    const operationName = fields?.__name || ''

    return {
        query: [
            `${operation} ${operationName}${varsString}${result}`,
            ...ctx.fragments,
        ].join(','),
        variables: Object.keys(ctx.variables).reduce<{ [name: string]: any }>(
            (r, v) => {
                r[v] = ctx.variables[v].value
                return r
            },
            {},
        ),
        ...(operationName ? { operationName: operationName.toString() } : {}),
    }
}

export const getFieldFromPath = (
    root: LinkedType | undefined,
    path: string[],
) => {
    let current: LinkedField | undefined

    if (!root) throw new Error('root type is not provided')

    if (path.length === 0) throw new Error(`path is empty`)

    path.forEach((f) => {
        const type = current ? current.type : root

        if (!type.fields)
            throw new Error(`type \`${type.name}\` does not have fields`)

        const possibleTypes = Object.keys(type.fields)
            .filter((i) => i.startsWith('on_'))
            .reduce(
                (types, fieldName) => {
                    const field = type.fields && type.fields[fieldName]
                    if (field) types.push(field.type)
                    return types
                },
                [type],
            )

        let field: LinkedField | null = null

        possibleTypes.forEach((type) => {
            const found = type.fields && type.fields[f]
            if (found) field = found
        })

        if (!field)
            throw new Error(
                `type \`${type.name}\` does not have a field \`${f}\``,
            )

        current = field
    })

    return current as LinkedField
}
