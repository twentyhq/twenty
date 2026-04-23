import { createOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/create-logic-function.util';
import { deleteLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/delete-logic-function.util';
import { executeLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/execute-logic-function.util';
import { updateLogicFunctionSource } from 'test/integration/metadata/suites/logic-function/utils/update-logic-function-source.util';

import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

// Default template function code that matches the expected behavior
const DEFAULT_TEMPLATE_FUNCTION_CODE = `export const main = async (params: { a: string; b: number }): Promise<object> => {
  return { message: \`Toto: \${params.a} and \${params.b}\` };
};`;

// Test function using external packages from default layer (lodash.groupby)
const EXTERNAL_PACKAGES_FUNCTION_CODE = `import groupBy from 'lodash.groupby';

export const main = async (params: { items: Array<{ category: string; name: string }> }): Promise<object> => {
  const grouped = groupBy(params.items, 'category');
  return {
    grouped,
    categories: Object.keys(grouped),
  };
};`;

// Test function that throws an error
const ERROR_FUNCTION_CODE = `export const main = async (params: { shouldFail: boolean }): Promise<object> => {
  if (params.shouldFail) {
    throw new Error('Intentional test error');
  }
  return { success: true };
};`;

describe('Logic Function Execution', () => {
  const createdFunctionIds: string[] = [];

  afterAll(async () => {
    // Clean up all created functions
    for (const functionId of createdFunctionIds) {
      try {
        await deleteLogicFunction({
          input: { id: functionId },
          expectToFail: false,
        });
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  it('should execute the default logic function template', async () => {
    // Create the function with default template code
    const { data: createData } = await createOneLogicFunction({
      input: {
        name: 'Test Default Function',
      },
      expectToFail: false,
    });

    const functionId = createData?.createOneLogicFunction?.id;

    expect(functionId).toBeDefined();
    createdFunctionIds.push(functionId);

    await updateLogicFunctionSource({
      input: {
        id: createData.createOneLogicFunction.id,
        update: {
          sourceHandlerCode: DEFAULT_TEMPLATE_FUNCTION_CODE,
          toolInputSchema: {
            type: 'object',
            properties: { message: { type: 'string' } },
          },
        },
      },
      expectToFail: false,
    });

    // Execute with the default template's expected params: { a: string, b: number }
    const { data: executeData } = await executeLogicFunction({
      input: {
        id: functionId,
        payload: { a: 'hello', b: 42 },
      },
      expectToFail: false,
    });

    const result = executeData?.executeOneLogicFunction;

    if (result?.status !== LogicFunctionExecutionStatus.SUCCESS) {
      throw new Error(JSON.stringify(result?.error, null, 2));
    }

    expect(result?.status).toBe(LogicFunctionExecutionStatus.SUCCESS);
    expect(result?.data).toMatchObject({
      message: 'Toto: hello and 42',
    });
    expect(result?.duration).toBeGreaterThan(0);
  });

  it('should execute a function with external packages (lodash.groupby)', async () => {
    // Create the function with the external packages code
    const { data: createData } = await createOneLogicFunction({
      input: {
        name: 'External Packages Test',
      },
      expectToFail: false,
    });

    const functionId = createData?.createOneLogicFunction?.id;

    expect(functionId).toBeDefined();
    createdFunctionIds.push(functionId);

    await updateLogicFunctionSource({
      input: {
        id: createData.createOneLogicFunction.id,
        update: {
          sourceHandlerCode: EXTERNAL_PACKAGES_FUNCTION_CODE,
          toolInputSchema: {
            type: 'object',
            properties: { message: { type: 'string' } },
          },
        },
      },
      expectToFail: false,
    });

    // Execute the function with items to group
    const { data: executeData } = await executeLogicFunction({
      input: {
        id: functionId,
        payload: {
          items: [
            { category: 'fruit', name: 'apple' },
            { category: 'vegetable', name: 'carrot' },
            { category: 'fruit', name: 'banana' },
          ],
        },
      },
      expectToFail: false,
    });

    const result = executeData?.executeOneLogicFunction;

    if (result?.status !== LogicFunctionExecutionStatus.SUCCESS) {
      throw new Error(JSON.stringify(result?.error, null, 2));
    }

    expect(result?.status).toBe(LogicFunctionExecutionStatus.SUCCESS);

    const data = result?.data as unknown as {
      grouped: Record<string, Array<{ category: string; name: string }>>;
      categories: string[];
    };

    expect(data?.grouped).toMatchObject({
      fruit: [
        { category: 'fruit', name: 'apple' },
        { category: 'fruit', name: 'banana' },
      ],
      vegetable: [{ category: 'vegetable', name: 'carrot' }],
    });
    expect(data?.categories).toEqual(
      expect.arrayContaining(['fruit', 'vegetable']),
    );
  });

  it('should create logic function without source', async () => {
    // Create the function with default template code
    const { data: createData } = await createOneLogicFunction({
      input: {
        name: 'Test Default Function',
      },
      expectToFail: false,
    });

    const functionId = createData?.createOneLogicFunction?.id;

    expect(functionId).toBeDefined();
    createdFunctionIds.push(functionId);

    // Execute with the default template's expected params: { a: string, b: number }
    const { data: executeData } = await executeLogicFunction({
      input: {
        id: functionId,
        payload: { a: 'hello', b: 42 },
      },
      expectToFail: false,
    });

    const result = executeData?.executeOneLogicFunction;

    if (result?.status !== LogicFunctionExecutionStatus.SUCCESS) {
      throw new Error(JSON.stringify(result?.error, null, 2));
    }

    expect(result?.status).toBe(LogicFunctionExecutionStatus.SUCCESS);
    expect(result?.data).toMatchObject({
      message: 'Hello, input: hello and 42',
    });
    expect(result?.duration).toBeGreaterThan(0);
  });

  it('should create logic function with source', async () => {
    // Create the function with default template code
    const { data: createData } = await createOneLogicFunction({
      input: {
        name: 'Test Default Function',
        source: {
          sourceHandlerCode: DEFAULT_TEMPLATE_FUNCTION_CODE,
          toolInputSchema: {
            type: 'object',
            properties: { message: { type: 'string' } },
          },
          handlerName: 'main',
        },
      },
      expectToFail: false,
    });

    const functionId = createData?.createOneLogicFunction?.id;

    expect(functionId).toBeDefined();
    createdFunctionIds.push(functionId);

    // Execute with the default template's expected params: { a: string, b: number }
    const { data: executeData } = await executeLogicFunction({
      input: {
        id: functionId,
        payload: { a: 'hello', b: 42 },
      },
      expectToFail: false,
    });

    const result = executeData?.executeOneLogicFunction;

    if (result?.status !== LogicFunctionExecutionStatus.SUCCESS) {
      throw new Error(JSON.stringify(result?.error, null, 2));
    }

    expect(result?.status).toBe(LogicFunctionExecutionStatus.SUCCESS);
    expect(result?.data).toMatchObject({
      message: 'Toto: hello and 42',
    });
    expect(result?.duration).toBeGreaterThan(0);
  });

  it('should handle errors thrown by logic functions', async () => {
    // Create the function with error-throwing code
    const { data: createData } = await createOneLogicFunction({
      input: {
        name: 'Error Test Function',
      },
      expectToFail: false,
    });

    const functionId = createData?.createOneLogicFunction?.id;

    expect(functionId).toBeDefined();
    createdFunctionIds.push(functionId);

    await updateLogicFunctionSource({
      input: {
        id: createData.createOneLogicFunction.id,
        update: {
          sourceHandlerCode: ERROR_FUNCTION_CODE,
          toolInputSchema: {
            type: 'object',
            properties: { message: { type: 'string' } },
          },
        },
      },
      expectToFail: false,
    });

    // Execute with shouldFail = false (should succeed)
    const { data: successData } = await executeLogicFunction({
      input: {
        id: functionId,
        payload: { shouldFail: false },
      },
      expectToFail: false,
    });

    expect(successData?.executeOneLogicFunction?.status).toBe(
      LogicFunctionExecutionStatus.SUCCESS,
    );
    expect(successData?.executeOneLogicFunction?.data).toMatchObject({
      success: true,
    });

    // Execute with shouldFail = true (should return error status)
    const { data: errorData } = await executeLogicFunction({
      input: {
        id: functionId,
        payload: { shouldFail: true },
      },
      expectToFail: false, // The GraphQL call succeeds, but the function execution fails
    });

    const errorResult = errorData?.executeOneLogicFunction;

    expect(errorResult?.status).toBe(LogicFunctionExecutionStatus.ERROR);
    expect(errorResult?.error).toMatchObject({
      errorType: 'UnhandledError',
      errorMessage: expect.stringContaining('Intentional test error'),
    });
    expect(errorResult?.data).toBeNull();
  });
});
