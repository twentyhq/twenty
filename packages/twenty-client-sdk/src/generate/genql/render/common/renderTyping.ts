// @ts-nocheck
import { GraphQLInputType, GraphQLNonNull, GraphQLOutputType, isListType, isNamedType, isNonNullType, isScalarType } from 'graphql'


const render = (
  type: GraphQLOutputType | GraphQLInputType,
  nonNull: boolean,
  root: boolean,
  undefinableValues: boolean,
  undefinableFields: boolean,
  wrap: (x: string) => string = x => x
): string => {
    
  if (root) {
    if (undefinableFields) {
      if (isNonNullType(type)) {
        return `: ${render(type.ofType, true, false, undefinableValues, undefinableFields, wrap)}`
      } else {
        const rendered = render(type, true, false, undefinableValues, undefinableFields, wrap)
        return undefinableValues ? `?: ${rendered}` : `?: (${rendered} | null)`
      }
    } else {
      return `: ${render(type, false, false, undefinableValues, undefinableFields, wrap)}`
    }
  }

  if (isNamedType(type)) {
    let typeName = type.name

    // if is a scalar use the scalar interface to not expose reserved words
    if (isScalarType(type)) {
      typeName = `Scalars['${typeName}']`
    }

    const typing = wrap(typeName)

    if (undefinableValues) {
      return nonNull ? typing : `(${typing} | undefined)`
    } else {
      return nonNull ? typing : `(${typing} | null)`
    }
  }

  if (isListType(type)) {
    const typing = `${render(type.ofType, false, false, undefinableValues, undefinableFields, wrap)}[]`

    if (undefinableValues) {
      return nonNull ? typing : `(${typing} | undefined)`
    } else {
      return nonNull ? typing : `(${typing} | null)`
    }
  }

  return render((type as GraphQLNonNull<any>).ofType, true, false, undefinableValues, undefinableFields, wrap)
}

export const renderTyping = (
  type: GraphQLOutputType | GraphQLInputType,
  undefinableValues: boolean,
  undefinableFields: boolean,
  root = true,
  wrap: any = undefined
) => render(type, false, root, undefinableValues, undefinableFields, wrap)
