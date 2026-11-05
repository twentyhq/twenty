// @ts-nocheck
import { GraphQLUnionType } from 'graphql'
import { RenderContext } from '../common/RenderContext'
import { typeComment } from '../common/comment'

// union should produce an object like
// export type ChangeCard = {
// 	__union:SpecialCard | EffectCard;
// 	__resolve:{
// 		['...on SpecialCard']: SpecialCard;
// 		['...on EffectCard']: EffectCard;
// 	}
// }

export const unionType = (type: GraphQLUnionType, ctx: RenderContext) => {
    let typeNames = type.getTypes().map((t) => t.name)
    if (ctx.config?.sortProperties) {
        typeNames = typeNames.sort()
    }
    ctx.addCodeBlock(
        `${typeComment(type)}export type ${type.name} = (${typeNames.join(
            ' | ',
        )}) & { __isUnion?: true }`,
    )
}

// export const unionType = (type: GraphQLUnionType, ctx: RenderContext) => {
//     const typeNames = type.getTypes().map((t) => t.name)
//     let resolveContent = typeNames
//         .map((name) => `on_${name}?: ${name}`)
//         .join('\n    ')

//     ctx.addCodeBlock(
//         `${typeComment(type)}export type ${type.name}={
//   __union:
//     ${typeNames.join('|')}
//   __resolve: {
//     ${resolveContent}
//   }
//   __typename?: string
// }`,
//     )
// }
