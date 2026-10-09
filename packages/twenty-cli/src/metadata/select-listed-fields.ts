import { type InspectedField } from '@/metadata/types/metadata-inspection.type';

export const selectListedFields = ({
  fields,
  includeSystemFields,
}: {
  fields: InspectedField[];
  includeSystemFields: boolean;
}) => {
  const listedFields = fields.filter(
    (field) => includeSystemFields || field.isSystem !== true,
  );

  return {
    fields: listedFields,
    hiddenSystemFieldCount: fields.length - listedFields.length,
  };
};
