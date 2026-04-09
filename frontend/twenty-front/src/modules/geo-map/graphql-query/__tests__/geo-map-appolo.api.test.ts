import {
  GET_AUTOCOMPLETE_QUERY,
  GET_PLACE_DETAILS_QUERY,
} from '@/geo-map/graphql-query/geo-map-appolo.api';
import { gql } from '@apollo/client';

describe('geo-map GraphQL queries', () => {
  describe('GET_AUTOCOMPLETE_QUERY', () => {
    it('should have the correct query structure', () => {
      expect(GET_AUTOCOMPLETE_QUERY).toBeDefined();
      expect(GET_AUTOCOMPLETE_QUERY.kind).toBe('Document');
    });

    it('should have the correct query name', () => {
      const queryDefinition = GET_AUTOCOMPLETE_QUERY.definitions[0] as any;
      expect(queryDefinition.name.value).toBe('GetAutoCompleteAddress');
    });

    it('should have the correct variables', () => {
      const queryDefinition = GET_AUTOCOMPLETE_QUERY.definitions[0] as any;
      const variables = queryDefinition.variableDefinitions;

      expect(variables).toHaveLength(4);

      const variableNames = variables.map((v: any) => v.variable.name.value);
      expect(variableNames).toContain('address');
      expect(variableNames).toContain('token');
      expect(variableNames).toContain('country');
      expect(variableNames).toContain('isFieldCity');
    });

    it('should have required variables marked correctly', () => {
      const queryDefinition = GET_AUTOCOMPLETE_QUERY.definitions[0] as any;
      const variables = queryDefinition.variableDefinitions;

      const addressVar = variables.find(
        (v: any) => v.variable.name.value === 'address',
      );
      const tokenVar = variables.find(
        (v: any) => v.variable.name.value === 'token',
      );
      const countryVar = variables.find(
        (v: any) => v.variable.name.value === 'country',
      );
      const isFieldCityVar = variables.find(
        (v: any) => v.variable.name.value === 'isFieldCity',
      );

      expect(addressVar.type.kind).toBe('NonNullType'); // Required
      expect(tokenVar.type.kind).toBe('NonNullType'); // Required
      expect(countryVar.type.kind).toBe('NamedType'); // Optional
      expect(isFieldCityVar.type.kind).toBe('NamedType'); // Optional
    });

    it('should request the correct fields', () => {
      const queryDefinition = GET_AUTOCOMPLETE_QUERY.definitions[0] as any;
      const selectionSet =
        queryDefinition.selectionSet.selections[0].selectionSet;
      const fields = selectionSet.selections.map((s: any) => s.name.value);

      expect(fields).toContain('text');
      expect(fields).toContain('placeId');
      expect(fields).toHaveLength(2);
    });

    it('should match the expected query string', () => {
      const expectedQuery = gql`
        query GetAutoCompleteAddress(
          $address: String!
          $token: String!
          $country: String
          $isFieldCity: Boolean
        ) {
          getAutoCompleteAddress(
            address: $address
            token: $token
            country: $country
            isFieldCity: $isFieldCity
          ) {
            text
            placeId
          }
        }
      `;

      expect(
        GET_AUTOCOMPLETE_QUERY.loc?.source.body.replace(/\s+/g, ' ').trim(),
      ).toBe(expectedQuery.loc?.source.body.replace(/\s+/g, ' ').trim());
    });
  });

  describe('GET_PLACE_DETAILS_QUERY', () => {
    it('should have the correct query structure', () => {
      expect(GET_PLACE_DETAILS_QUERY).toBeDefined();
      expect(GET_PLACE_DETAILS_QUERY.kind).toBe('Document');
    });

    it('should have the correct query name', () => {
      const queryDefinition = GET_PLACE_DETAILS_QUERY.definitions[0] as any;
      expect(queryDefinition.name.value).toBe('GetAddressDetails');
    });

    it('should have the correct variables', () => {
      const queryDefinition = GET_PLACE_DETAILS_QUERY.definitions[0] as any;
      const variables = queryDefinition.variableDefinitions;

      expect(variables).toHaveLength(2);

      const variableNames = variables.map((v: any) => v.variable.name.value);
      expect(variableNames).toContain('placeId');
      expect(variableNames).toContain('token');
    });

    it('should have required variables marked correctly', () => {
      const queryDefinition = GET_PLACE_DETAILS_QUERY.definitions[0] as any;
      const variables = queryDefinition.variableDefinitions;

      const placeIdVar = variables.find(
        (v: any) => v.variable.name.value === 'placeId',
      );
      const tokenVar = variables.find(
        (v: any) => v.variable.name.value === 'token',
      );

      expect(placeIdVar.type.kind).toBe('NonNullType'); // Required
      expect(tokenVar.type.kind).toBe('NonNullType'); // Required
    });

    it('should request the correct fields', () => {
      const queryDefinition = GET_PLACE_DETAILS_QUERY.definitions[0] as any;
      const selectionSet =
        queryDefinition.selectionSet.selections[0].selectionSet;
      const fields = selectionSet.selections.map((s: any) => s.name.value);

      expect(fields).toContain('state');
      expect(fields).toContain('postcode');
      expect(fields).toContain('city');
      expect(fields).toContain('country');
      expect(fields).toContain('location');
      expect(fields).toHaveLength(5);
    });

    it('should match the expected query string', () => {
      const expectedQuery = gql`
        query GetAddressDetails($placeId: String!, $token: String!) {
          getAddressDetails(placeId: $placeId, token: $token) {
            state
            postcode
            city
            country
            location {
              lat
              lng
            }
          }
        }
      `;

      expect(
        GET_PLACE_DETAILS_QUERY.loc?.source.body.replace(/\s+/g, ' ').trim(),
      ).toBe(expectedQuery.loc?.source.body.replace(/\s+/g, ' ').trim());
    });
  });

  describe('query validation', () => {
    it('should have valid GraphQL syntax for both queries', () => {
      expect(() => {
        // This will throw if the query is malformed
        expect(GET_AUTOCOMPLETE_QUERY.definitions[0]).toBeDefined();
        expect(GET_PLACE_DETAILS_QUERY.definitions[0]).toBeDefined();
      }).not.toThrow();
    });

    it('should have consistent naming conventions', () => {
      const autocompleteQuery = GET_AUTOCOMPLETE_QUERY.definitions[0] as any;
      const detailsQuery = GET_PLACE_DETAILS_QUERY.definitions[0] as any;

      // Both should use PascalCase for query names
      expect(autocompleteQuery.name.value).toMatch(/^[A-Z][a-zA-Z]*$/);
      expect(detailsQuery.name.value).toMatch(/^[A-Z][a-zA-Z]*$/);

      // Both should use camelCase for field names
      const autocompleteFields =
        autocompleteQuery.selectionSet.selections[0].selectionSet.selections;
      const detailsFields =
        detailsQuery.selectionSet.selections[0].selectionSet.selections;

      autocompleteFields.forEach((field: any) => {
        expect(field.name.value).toMatch(/^[a-z][a-zA-Z]*$/);
      });

      detailsFields.forEach((field: any) => {
        expect(field.name.value).toMatch(/^[a-z][a-zA-Z]*$/);
      });
    });
  });
});
