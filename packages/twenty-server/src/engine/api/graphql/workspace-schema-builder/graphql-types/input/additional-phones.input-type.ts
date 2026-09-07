import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

const AdditionalPhoneInputType = new GraphQLInputObjectType({
  name: 'AdditionalPhoneInput',
  fields: {
    number: { type: GraphQLString },
    callingCode: { type: GraphQLString },
    countryCode: { type: GraphQLString },
  },
});

export const AdditionalPhonesInputType = new GraphQLList(
  new GraphQLNonNull(AdditionalPhoneInputType),
);
