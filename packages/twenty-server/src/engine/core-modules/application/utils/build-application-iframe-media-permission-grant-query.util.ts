import { type IframeMediaPermission } from 'twenty-shared/types';

const SQL_SINGLE_QUOTE_PATTERN = /'/g;

export const buildApplicationIframeMediaPermissionGrantQuery = (
  permissions: IframeMediaPermission[],
): string => {
  const permissionsLiteral = JSON.stringify(permissions).replace(
    SQL_SINGLE_QUOTE_PATTERN,
    "''",
  );

  return `(
    SELECT COALESCE(jsonb_agg(permission), '[]'::jsonb)
    FROM (
      SELECT origin, bool_or(microphone) AS microphone, bool_or(camera) AS camera
      FROM jsonb_to_recordset("grantedIframeMediaPermissions" || '${permissionsLiteral}'::jsonb)
        AS requested_permission(origin text, microphone boolean, camera boolean)
      GROUP BY origin
      ORDER BY origin
    ) AS permission
  )`;
};
