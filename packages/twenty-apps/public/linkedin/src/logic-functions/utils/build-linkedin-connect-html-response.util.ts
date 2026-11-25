import { Response } from 'twenty-sdk/logic-function';

export const buildLinkedinConnectHtmlResponse = ({
  page,
  status = 200,
}: {
  page: string;
  status?: number;
}): Response =>
  new Response(page, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
