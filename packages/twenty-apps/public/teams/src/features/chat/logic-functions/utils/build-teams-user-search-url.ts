const escapeODataStringLiteral = (value: string): string =>
  value.replace(/'/g, "''");

export const buildTeamsUserSearchUrl = ({
  query,
  top,
}: {
  query: string;
  top: number;
}): string => {
  const escapedQuery = escapeODataStringLiteral(query);
  // startswith on these properties is case-insensitive and needs no advanced
  // query header, unlike $search.
  const filter = [
    `startswith(displayName,'${escapedQuery}')`,
    `startswith(mail,'${escapedQuery}')`,
    `startswith(userPrincipalName,'${escapedQuery}')`,
  ].join(' or ');

  return `users?$select=id,displayName,mail,userPrincipalName&$filter=${encodeURIComponent(
    filter,
  )}&$top=${top}`;
};
