import { randomUUID } from 'crypto';

import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { restoreManyOperationFactory } from 'test/integration/graphql/utils/restore-many-operation-factory.util';
import { restoreOneOperationFactory } from 'test/integration/graphql/utils/restore-one-operation-factory.util';

const TASK_GQL_FIELDS = `
  id
  title
  deletedAt
`;

const TASK_TARGET_GQL_FIELDS = `
  id
  taskId
  deletedAt
`;

describe('taskTargets hooks on task actions', () => {
  const taskIds: string[] = [];
  const taskTargetIds: string[] = [];

  afterAll(async () => {
    if (taskIds.length > 0) {
      const destroyTasksOperation = destroyManyOperationFactory({
        objectMetadataSingularName: 'task',
        objectMetadataPluralName: 'tasks',
        gqlFields: 'id',
        filter: { id: { in: taskIds } },
      });

      await makeGraphqlAPIRequest(destroyTasksOperation);
    }

    if (taskTargetIds.length > 0) {
      const destroyTaskTargetsOperation = destroyManyOperationFactory({
        objectMetadataSingularName: 'taskTarget',
        objectMetadataPluralName: 'taskTargets',
        gqlFields: 'id',
        filter: { id: { in: taskTargetIds } },
      });

      await makeGraphqlAPIRequest(destroyTaskTargetsOperation);
    }
  });

  it('deleteOne task should soft delete related taskTargets', async () => {
    const taskId = randomUUID();
    const taskTargetId = randomUUID();

    taskIds.push(taskId);
    taskTargetIds.push(taskTargetId);

    await createOneOperation({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      input: { id: taskId, title: 'Test Task for DeleteOne' },
    });

    await createOneOperation({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      input: { id: taskTargetId, taskId },
    });

    const deleteTaskOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      recordId: taskId,
    });

    const deleteResponse = await makeGraphqlAPIRequest(deleteTaskOperation);

    expect(deleteResponse.body.data.deleteTask).toBeDefined();
    expect(deleteResponse.body.data.deleteTask.deletedAt).not.toBeNull();

    const findTaskTargetsOperation = findManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: {
        id: { eq: taskTargetId },
        not: { deletedAt: { is: 'NULL' } },
      },
    });

    const taskTargetResponse = await makeGraphqlAPIRequest(
      findTaskTargetsOperation,
    );

    expect(taskTargetResponse.body.data.taskTargets.edges).toHaveLength(1);
    expect(
      taskTargetResponse.body.data.taskTargets.edges[0].node.deletedAt,
    ).not.toBeNull();
  });

  it('deleteMany tasks should soft delete related taskTargets', async () => {
    const taskId1 = randomUUID();
    const taskId2 = randomUUID();
    const taskTargetId1 = randomUUID();
    const taskTargetId2 = randomUUID();

    taskIds.push(taskId1, taskId2);
    taskTargetIds.push(taskTargetId1, taskTargetId2);

    await Promise.all([
      createOneOperation({
        objectMetadataSingularName: 'task',
        gqlFields: TASK_GQL_FIELDS,
        input: { id: taskId1, title: 'Test Task 1 for DeleteMany' },
      }),
      createOneOperation({
        objectMetadataSingularName: 'task',
        gqlFields: TASK_GQL_FIELDS,
        input: { id: taskId2, title: 'Test Task 2 for DeleteMany' },
      }),
    ]);

    await Promise.all([
      createOneOperation({
        objectMetadataSingularName: 'taskTarget',
        gqlFields: TASK_TARGET_GQL_FIELDS,
        input: { id: taskTargetId1, taskId: taskId1 },
      }),
      createOneOperation({
        objectMetadataSingularName: 'taskTarget',
        gqlFields: TASK_TARGET_GQL_FIELDS,
        input: { id: taskTargetId2, taskId: taskId2 },
      }),
    ]);

    const deleteTasksOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'task',
      objectMetadataPluralName: 'tasks',
      gqlFields: TASK_GQL_FIELDS,
      filter: { id: { in: [taskId1, taskId2] } },
    });

    const deleteResponse = await makeGraphqlAPIRequest(deleteTasksOperation);

    expect(deleteResponse.body.data.deleteTasks).toHaveLength(2);

    const findTaskTargetsOperation = findManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: {
        id: { in: [taskTargetId1, taskTargetId2] },
        not: { deletedAt: { is: 'NULL' } },
      },
    });

    const taskTargetResponse = await makeGraphqlAPIRequest(
      findTaskTargetsOperation,
    );

    expect(taskTargetResponse.body.data.taskTargets.edges).toHaveLength(2);
    expect(
      taskTargetResponse.body.data.taskTargets.edges[0].node.deletedAt,
    ).not.toBeNull();
    expect(
      taskTargetResponse.body.data.taskTargets.edges[1].node.deletedAt,
    ).not.toBeNull();
  });

  it('restoreOne task should restore related taskTargets', async () => {
    const taskId = randomUUID();
    const taskTargetId = randomUUID();

    taskIds.push(taskId);
    taskTargetIds.push(taskTargetId);

    await createOneOperation({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      input: { id: taskId, title: 'Test Task for RestoreOne' },
    });

    await createOneOperation({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      input: { id: taskTargetId, taskId },
    });

    const deleteTaskOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      recordId: taskId,
    });

    await makeGraphqlAPIRequest(deleteTaskOperation);

    const restoreTaskOperation = restoreOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      recordId: taskId,
    });

    const restoreResponse = await makeGraphqlAPIRequest(restoreTaskOperation);

    expect(restoreResponse.body.data.restoreTask).toBeDefined();
    expect(restoreResponse.body.data.restoreTask.deletedAt).toBeNull();

    const findTaskTargetsOperation = findManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: { id: { eq: taskTargetId } },
    });

    const taskTargetResponse = await makeGraphqlAPIRequest(
      findTaskTargetsOperation,
    );

    expect(taskTargetResponse.body.data.taskTargets.edges).toHaveLength(1);
    expect(
      taskTargetResponse.body.data.taskTargets.edges[0].node.deletedAt,
    ).toBeNull();
  });

  it('restoreMany tasks should restore related taskTargets', async () => {
    const taskId1 = randomUUID();
    const taskId2 = randomUUID();
    const taskTargetId1 = randomUUID();
    const taskTargetId2 = randomUUID();

    taskIds.push(taskId1, taskId2);
    taskTargetIds.push(taskTargetId1, taskTargetId2);

    await Promise.all([
      createOneOperation({
        objectMetadataSingularName: 'task',
        gqlFields: TASK_GQL_FIELDS,
        input: { id: taskId1, title: 'Test Task 1 for RestoreMany' },
      }),
      createOneOperation({
        objectMetadataSingularName: 'task',
        gqlFields: TASK_GQL_FIELDS,
        input: { id: taskId2, title: 'Test Task 2 for RestoreMany' },
      }),
    ]);

    await Promise.all([
      createOneOperation({
        objectMetadataSingularName: 'taskTarget',
        gqlFields: TASK_TARGET_GQL_FIELDS,
        input: { id: taskTargetId1, taskId: taskId1 },
      }),
      createOneOperation({
        objectMetadataSingularName: 'taskTarget',
        gqlFields: TASK_TARGET_GQL_FIELDS,
        input: { id: taskTargetId2, taskId: taskId2 },
      }),
    ]);

    const deleteTasksOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'task',
      objectMetadataPluralName: 'tasks',
      gqlFields: TASK_GQL_FIELDS,
      filter: { id: { in: [taskId1, taskId2] } },
    });

    await makeGraphqlAPIRequest(deleteTasksOperation);

    const restoreTasksOperation = restoreManyOperationFactory({
      objectMetadataSingularName: 'task',
      objectMetadataPluralName: 'tasks',
      gqlFields: TASK_GQL_FIELDS,
      filter: { id: { in: [taskId1, taskId2] } },
    });

    const restoreResponse = await makeGraphqlAPIRequest(restoreTasksOperation);

    expect(restoreResponse.body.data.restoreTasks).toHaveLength(2);

    const findTaskTargetsOperation = findManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: { id: { in: [taskTargetId1, taskTargetId2] } },
    });

    const taskTargetResponse = await makeGraphqlAPIRequest(
      findTaskTargetsOperation,
    );

    expect(taskTargetResponse.body.data.taskTargets.edges).toHaveLength(2);
    expect(
      taskTargetResponse.body.data.taskTargets.edges[0].node.deletedAt,
    ).toBeNull();
    expect(
      taskTargetResponse.body.data.taskTargets.edges[1].node.deletedAt,
    ).toBeNull();
  });

  it('destroyOne task should destroy related taskTargets', async () => {
    const taskId = randomUUID();
    const taskTargetId = randomUUID();

    taskIds.push(taskId);

    await createOneOperation({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      input: { id: taskId, title: 'Test Task for DestroyOne' },
    });

    await createOneOperation({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      input: { id: taskTargetId, taskId },
    });

    const destroyTaskOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: 'id',
      recordId: taskId,
    });

    const destroyResponse = await makeGraphqlAPIRequest(destroyTaskOperation);

    expect(destroyResponse.body.data.destroyTask).toBeDefined();

    const findTaskTargetsOperation = findManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: { id: { eq: taskTargetId } },
    });

    const taskTargetResponse = await makeGraphqlAPIRequest(
      findTaskTargetsOperation,
    );

    expect(taskTargetResponse.body.data.taskTargets.edges).toHaveLength(0);
  });

  it('destroyMany tasks should destroy related taskTargets', async () => {
    const taskId1 = randomUUID();
    const taskId2 = randomUUID();
    const taskTargetId1 = randomUUID();
    const taskTargetId2 = randomUUID();

    taskIds.push(taskId1, taskId2);

    await Promise.all([
      createOneOperation({
        objectMetadataSingularName: 'task',
        gqlFields: TASK_GQL_FIELDS,
        input: { id: taskId1, title: 'Test Task 1 for DestroyMany' },
      }),
      createOneOperation({
        objectMetadataSingularName: 'task',
        gqlFields: TASK_GQL_FIELDS,
        input: { id: taskId2, title: 'Test Task 2 for DestroyMany' },
      }),
    ]);

    await Promise.all([
      createOneOperation({
        objectMetadataSingularName: 'taskTarget',
        gqlFields: TASK_TARGET_GQL_FIELDS,
        input: { id: taskTargetId1, taskId: taskId1 },
      }),
      createOneOperation({
        objectMetadataSingularName: 'taskTarget',
        gqlFields: TASK_TARGET_GQL_FIELDS,
        input: { id: taskTargetId2, taskId: taskId2 },
      }),
    ]);

    const destroyTasksOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'task',
      objectMetadataPluralName: 'tasks',
      gqlFields: 'id',
      filter: { id: { in: [taskId1, taskId2] } },
    });

    const destroyResponse = await makeGraphqlAPIRequest(destroyTasksOperation);

    expect(destroyResponse.body.data.destroyTasks).toHaveLength(2);

    const findTaskTargetsOperation = findManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: { id: { in: [taskTargetId1, taskTargetId2] } },
    });

    const taskTargetResponse = await makeGraphqlAPIRequest(
      findTaskTargetsOperation,
    );

    expect(taskTargetResponse.body.data.taskTargets.edges).toHaveLength(0);
  });
});
