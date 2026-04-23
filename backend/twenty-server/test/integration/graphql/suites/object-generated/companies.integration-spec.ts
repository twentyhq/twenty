import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('companiesResolver (e2e)', () => {
  it('should find many companies', () => {
    const queryData = {
      query: `
        query companies {
          companies {
            edges {
              node {
                name
                employees
                idealCustomerProfile
                position
                searchVector
                id
                createdAt
                updatedAt
                deletedAt
                accountOwnerId
                tagline
                workPolicy
                visaSponsorship
              }
            }
          }
        }
      `,
    };

    return client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.companies;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const companies = edges[0].node;

          expect(companies).toHaveProperty('name');
          expect(companies).toHaveProperty('employees');
          expect(companies).toHaveProperty('idealCustomerProfile');
          expect(companies).toHaveProperty('position');
          expect(companies).toHaveProperty('searchVector');
          expect(companies).toHaveProperty('id');
          expect(companies).toHaveProperty('createdAt');
          expect(companies).toHaveProperty('updatedAt');
          expect(companies).toHaveProperty('deletedAt');
          expect(companies).toHaveProperty('accountOwnerId');
          expect(companies).toHaveProperty('tagline');
          expect(companies).toHaveProperty('workPolicy');
          expect(companies).toHaveProperty('visaSponsorship');
        }
      });
  });
});
