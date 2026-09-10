import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const AdditionalPhoneObjectType = new GraphQLObjectType({
  name: 'AdditionalPhone',
  fields: {
    number: { type: GraphQLString },
    callingCode: { type: GraphQLString },
    countryCode: { type: GraphQLString },
  },
});

export const AdditionalPhonesObjectType = new GraphQLList(
  new GraphQLNonNull(AdditionalPhoneObjectType),
);
