import {
  readBooleanOption,
  readStringArgument,
} from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { fetchMetadataInspection } from '@/metadata/fetch-metadata-inspection';
import { formatMetadataFields } from '@/metadata/format-metadata-fields';
import { selectListedFields } from '@/metadata/select-listed-fields';

export const runMetadataFieldListCommand: CommandRun<
  TargetCommandContext
> = async ({
  arguments: commandArguments,
  options,
  target,
  signal,
  output,
}) => {
  const inspection = await fetchMetadataInspection({
    objectName: readStringArgument(commandArguments, 0) ?? '',
    target,
    signal,
    output,
  });
  const { object } = inspection;
  const { fields, hiddenSystemFieldCount } = selectListedFields({
    fields: inspection.fields,
    includeSystemFields: readBooleanOption(options, 'all'),
  });

  return {
    data: { object, fields, hiddenSystemFieldCount },
    human: [
      `${object.labelPlural} (${object.namePlural})`,
      formatMetadataFields({
        fields,
        hiddenSystemFieldCount,
        labelIdentifierFieldMetadataId: object.labelIdentifierFieldMetadataId,
      }),
    ].join('\n\n'),
  };
};
