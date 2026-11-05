// @ts-nocheck
import {
    GraphQLInterfaceType,
    GraphQLObjectType,
    isObjectType,
} from 'graphql'
import { fieldComment, typeComment } from '../common/comment'
import { RenderContext } from '../common/RenderContext'
import { renderTyping } from '../common/renderTyping'
import { sortKeys } from '../common/support'

const INDENTATION = '    '

export const objectType = (
    type: GraphQLObjectType | GraphQLInterfaceType,
    ctx: RenderContext,
) => {
    let fieldsMap = type.getFields()

    if (ctx.config?.sortProperties) {
        fieldsMap = sortKeys(fieldsMap)
    }

    const fields = Object.keys(fieldsMap).map(
        (fieldName) => fieldsMap[fieldName],
    )

    if (!ctx.schema) throw new Error('no schema provided')

    const typeNames = isObjectType(type)
        ? [type.name]
        : ctx.schema.getPossibleTypes(type).map((t) => t.name)

    let fieldStrings = fields
        .map((f) => {
            return `${fieldComment(f)}${f.name}${renderTyping(
                f.type,
                true,
                true,
            )}`
        })
        .concat([
            `__typename: ${
                typeNames.length > 0
                    ? typeNames.map((t) => `'${t}'`).join('|')
                    : 'string'
            }`,
        ])
    // add indentation
    fieldStrings = fieldStrings.map((x) =>
        x
            .split('\n')
            .filter(Boolean)
            .map((l) => INDENTATION + l)
            .join('\n'),
    )

    // there is no need to add extensions as in graphql the implemented type must explicitly add the fields
    // const interfaceNames = isObjectType(type)
    //     ? type.getInterfaces().map((i) => i.name)
    //     : []
    // let extensions =
    //     interfaceNames.length > 0 ? ` extends ${interfaceNames.join(',')}` : ''
    ctx.addCodeBlock(
        `${typeComment(type)}export interface ${
            type.name
        } {\n${fieldStrings.join('\n')}\n}`,
    )
}
