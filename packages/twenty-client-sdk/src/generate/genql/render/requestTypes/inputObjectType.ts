// @ts-nocheck
import { GraphQLInputObjectType } from 'graphql'
import { argumentComment, typeComment } from '../common/comment'
import { RenderContext } from '../common/RenderContext'
import { renderTyping } from '../common/renderTyping'
import { sortKeys } from '../common/support'

export const inputObjectType = (type: GraphQLInputObjectType, ctx: RenderContext) => {
  let fields = type.getFields()

    if (ctx.config?.sortProperties) {
        fields = sortKeys(fields)
    }

  
  const fieldTypeOverrides = ctx.config?.fieldTypeOverrides?.[type.name]

  const fieldStrings = Object.keys(fields).map(fieldName => {
    const field = fields[fieldName]
    const overriddenType = fieldTypeOverrides?.[field.name]
    return `${argumentComment(field)}${field.name}${renderTyping(field.type, false, true, true, overriddenType ? () => overriddenType : undefined)}`
  })

  ctx.addCodeBlock(`${typeComment(type)}export interface ${type.name} {${fieldStrings.join(',')}}`)
}
