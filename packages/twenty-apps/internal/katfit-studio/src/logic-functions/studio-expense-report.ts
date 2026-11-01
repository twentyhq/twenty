import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';
import {
  isExpenseMonth,
  summarizeExpenses,
  type Expense,
} from 'src/logic-functions/utils/expense';

export const studioExpenseReportHandler = async (
  payload: RoutePayload<{ month?: unknown }>,
): Promise<Response> => {
  const month = payload.body?.month;
  if (!isExpenseMonth(month))
    return new Response({ error: 'Месяц: YYYY-MM' }, { status: 400 });
  const next = new Date(`${month}-01T00:00:00Z`);
  next.setUTCMonth(next.getUTCMonth() + 1);
  const bounds = { gte: `${month}-01`, lt: next.toISOString().slice(0, 10) };
  const client = new CoreApiClient();
  const expenses: Expense[] = [];
  let after: string | undefined;
  const cursors = new Set<string>();
  // A partial financial total must never be presented as a complete report.
  for (let page = 0; page < 100; page++) {
    const result = (await client.query({
      studioExpenses: {
        __args: {
          first: 100,
          ...(after ? { after } : {}),
          filter: {
            or: [
              {
                and: [
                  { accruedOn: { gte: bounds.gte } },
                  { accruedOn: { lt: bounds.lt } },
                ],
              },
              {
                and: [
                  { paidOn: { gte: bounds.gte } },
                  { paidOn: { lt: bounds.lt } },
                ],
              },
            ],
          },
        },
        edges: {
          node: {
            id: true,
            name: true,
            amount: { amountMicros: true, currencyCode: true },
            category: true,
            description: true,
            paidOn: true,
            accruedOn: true,
            costType: true,
          },
        },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    } as never)) as {
      studioExpenses?: {
        edges?: { node: Expense }[];
        pageInfo?: { hasNextPage?: boolean; endCursor?: string };
      };
    };
    const connection = result.studioExpenses;
    if (
      !connection?.edges ||
      typeof connection.pageInfo?.hasNextPage !== 'boolean'
    )
      throw new Error('Неполный ответ CRM');
    expenses.push(...connection.edges.map(({ node }) => node));
    if (!connection.pageInfo.hasNextPage) {
      try {
        return new Response(
          { ...summarizeExpenses(expenses, month), expenses },
          { status: 200 },
        );
      } catch (error) {
        return new Response(
          {
            error:
              error instanceof Error
                ? error.message
                : 'Некорректные данные CRM',
          },
          { status: 409 },
        );
      }
    }
    after = connection.pageInfo.endCursor;
    if (!after || cursors.has(after))
      throw new Error('Некорректная пагинация CRM');
    cursors.add(after);
  }
  return new Response(
    { error: 'Слишком много расходов для полного отчёта' },
    { status: 422 },
  );
};

export default defineLogicFunction({
  universalIdentifier: 'e998d118-a145-43cd-8d2e-b020279060a2',
  name: 'studio-expense-report',
  description: 'Помесячные начисления и выплаты расходов',
  timeoutSeconds: 60,
  handler: studioExpenseReportHandler,
  httpRouteTriggerSettings: {
    path: '/studio/expenses/report',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
