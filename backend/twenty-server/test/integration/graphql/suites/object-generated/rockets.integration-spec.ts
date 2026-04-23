import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('petsResolver (e2e)', () => {
  it('should find many pets', () => {
    const queryData = {
      query: `
        query pets {
          pets {
            edges {
              node {
                id
                name
                createdAt
                updatedAt
                deletedAt
                position
                searchVector
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
        const data = res.body.data.pets;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const pets = edges[0].node;

          expect(pets).toHaveProperty('id');
          expect(pets).toHaveProperty('name');
          expect(pets).toHaveProperty('createdAt');
          expect(pets).toHaveProperty('updatedAt');
          expect(pets).toHaveProperty('deletedAt');
          expect(pets).toHaveProperty('position');
          expect(pets).toHaveProperty('searchVector');
        }
      });
  });
});
