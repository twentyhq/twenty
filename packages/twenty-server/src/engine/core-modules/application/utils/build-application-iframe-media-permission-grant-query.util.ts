import { type IframeMediaPermission } from 'twenty-shared/types';

export const buildApplicationIframeMediaPermissionGrantQuery = (
  permissions: IframeMediaPermission[],
) => ({
  query: `(
    SELECT COALESCE(jsonb_agg(permission), '[]'::jsonb)
    FROM (
      SELECT origin, bool_or(microphone) AS microphone, bool_or(camera) AS camera
      FROM jsonb_to_recordset("grantedIframeMediaPermissions" || :approvedIframeMediaPermissions::jsonb)
        AS requested_permission(origin text, microphone boolean, camera boolean)
      GROUP BY origin
      ORDER BY origin
    ) AS permission
  )`,
  parameters: {
    approvedIframeMediaPermissions: JSON.stringify(permissions),
  },
});
