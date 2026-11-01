import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';
import { isString } from '@sniptt/guards';
import {
  parseExpense,
  type ExpenseInput,
} from 'src/logic-functions/utils/expense';

export const studioExpensesHandler = async (
  payload: RoutePayload<ExpenseInput & { expenseId?: unknown }>,
): Promise<Response> => {
  const input = payload.body ?? {};
  let data;
  try {
    data = parseExpense(input);
    if (
      input.expenseId !== undefined &&
      (!isString(input.expenseId) ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          input.expenseId,
        ))
    )
      throw new Error('Некорректный expenseId');
  } catch (error) {
    return new Response(
      { error: error instanceof Error ? error.message : 'Некорректный расход' },
      { status: 400 },
    );
  }
  const client = new CoreApiClient();
  const result = input.expenseId
    ? await client.mutation({
        updateStudioExpense: {
          __args: { id: input.expenseId, data },
          id: true,
        },
      } as never)
    : await client.mutation({
        createStudioExpense: { __args: { data }, id: true },
      } as never);
  return new Response(result, { status: input.expenseId ? 200 : 201 });
};

export default defineLogicFunction({
  universalIdentifier: '25686514-6bc6-49b4-9b0e-233590f9f630',
  name: 'studio-expenses',
  description: 'Создание и исправление расходов студии',
  timeoutSeconds: 20,
  handler: studioExpensesHandler,
  httpRouteTriggerSettings: {
    path: '/studio/expenses/save',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
