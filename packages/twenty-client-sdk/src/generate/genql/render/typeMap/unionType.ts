// @ts-nocheck
import { GraphQLUnionType } from 'graphql'
import { RenderContext } from '../common/RenderContext'
import { FieldMap } from '../../runtime/types'
import uniq from 'lodash/uniq.js'

export const unionType = (type: GraphQLUnionType, _: RenderContext) => {
    const types = type.getTypes()
    const typeObj: FieldMap<string> = types.reduce<FieldMap<string>>((r, t) => {
        r[`on_${t.name}`] = { type: t.name }
        return r
    }, {})

    const commonInterfaces = uniq(types.map((x) => x.getInterfaces()).flat())
    commonInterfaces.forEach((t) => {
        typeObj[`on_${t.name}`] = { type: t.name }
    })

    typeObj.__typename = { type: 'String' }

    return typeObj
}
