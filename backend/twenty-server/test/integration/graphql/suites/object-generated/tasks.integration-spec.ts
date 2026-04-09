import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('tasksResolver (e2e)', () => {
  it('should find many tasks', () => {
    const queryData = {
      query: `
        query tasks {
          tasks {
            edges {
              node {
                position
                title
                bodyV2 {
                  markdown
                  blocknote
                }
                dueAt
                status
                id
                createdAt
                updatedAt
                deletedAt
                assigneeId
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
        const data = res.body.data.tasks;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const tasks = edges[0].node;

          expect(tasks).toHaveProperty('position');
          expect(tasks).toHaveProperty('title');
          expect(tasks).toHaveProperty('bodyV2');
          expect(tasks).toHaveProperty('dueAt');
          expect(tasks).toHaveProperty('status');
          expect(tasks).toHaveProperty('id');
          expect(tasks).toHaveProperty('createdAt');
          expect(tasks).toHaveProperty('updatedAt');
          expect(tasks).toHaveProperty('deletedAt');
          expect(tasks).toHaveProperty('assigneeId');
        }
      });
  });
});
