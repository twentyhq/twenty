import { MetadataApiClient } from "twenty-client-sdk/metadata";

export const findAllObjectsAndFields = async (client: MetadataApiClient) => {
  return await client.query({
    objects: {
      __args: {
        paging: {
          first: 1000
        },
        filter: {}
      },
      edges: {
        node: {
          applicationId: true,
          color: true,
          description: true,
          duplicateCriteria: true,
          icon: true,
          id: true,
          imageIdentifierFieldMetadataId: true,
          isActive: true,
          isLabelSyncedWithName: true,
          isRemote: true,
          isSearchable: true,
          isSystem: true,
          isUICreatable: true,
          isUIEditable: true,
          labelIdentifierFieldMetadataId: true,
          labelPlural: true,
          labelSingular: true,
          namePlural: true,
          nameSingular: true,
          openRecordIn: true,
          shortcut: true,
          universalIdentifier: true,
          fieldsList: {
            applicationId: true,
            defaultValue: true,
            description: true,
            icon: true,
            id: true,
            isActive: true,
            isLabelSyncedWithName: true,
            isNullable: true,
            isSystem: true,
            isUIEditable: true,
            isUnique: true,
            label: true,
            morphId: true,
            name: true,
            options: true,
            settings: true,
            type: true,
            universalIdentifier: true,
            // relations?
          }
        }
      }
    }
  })
}