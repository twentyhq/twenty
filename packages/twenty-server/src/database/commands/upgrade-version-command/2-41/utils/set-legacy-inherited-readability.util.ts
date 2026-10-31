import { type DataSource } from 'typeorm';

// Nothing reads the legacy readability columns at runtime, but later upgrade commands still do
export const setLegacyInheritedReadability = async ({
  coreDataSource,
  workspaceId,
  objects,
  isDryRun,
}: {
  coreDataSource: DataSource;
  workspaceId: string;
  objects: readonly {
    universalIdentifier: string;
    readabilityParentFieldUniversalIdentifiers: readonly string[];
  }[];
  isDryRun: boolean;
}): Promise<number> => {
  let updatedCount = 0;

  for (const {
    universalIdentifier,
    readabilityParentFieldUniversalIdentifiers,
  } of objects) {
    const filter = `"workspaceId" = $1 AND "universalIdentifier" = $2
      AND NOT (readability = 'INHERITED'
        AND "readabilityParentFieldUniversalIdentifiers" @> $3::uuid[]
        AND "readabilityParentFieldUniversalIdentifiers" <@ $3::uuid[])`;
    const parameters = [
      workspaceId,
      universalIdentifier,
      readabilityParentFieldUniversalIdentifiers,
    ];
    const rows: { id: string }[] = isDryRun
      ? await coreDataSource.query(
          `SELECT id FROM core."objectMetadata" WHERE ${filter}`,
          parameters,
        )
      : await coreDataSource.query(
          `UPDATE core."objectMetadata"
            SET readability = 'INHERITED', "readabilityParentFieldUniversalIdentifiers" = $3::uuid[]
            WHERE ${filter} RETURNING id`,
          parameters,
        );

    updatedCount += rows.length;
  }

  return updatedCount;
};
