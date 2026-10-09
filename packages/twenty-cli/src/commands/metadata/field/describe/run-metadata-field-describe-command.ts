import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { readStringArgument } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { fetchMetadataInspection } from '@/metadata/fetch-metadata-inspection';
import { formatMetadataRelations } from '@/metadata/format-metadata-fields';
import { formatMetadataOwner } from '@/metadata/format-metadata-owner';
import { getFieldOptions } from '@/metadata/get-field-options';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { formatDetails } from '@/output/format-details';
import { formatTable } from '@/output/format-table';

const formatBoolean = (value?: boolean) =>
  isDefined(value) ? String(value) : 'unknown';

export const runMetadataFieldDescribeCommand: CommandRun<
  TargetCommandContext
> = async ({ arguments: commandArguments, target, signal, output }) => {
  const fieldName = readStringArgument(commandArguments, 1) ?? '';
  const { object, fields } = await fetchMetadataInspection({
    objectName: readStringArgument(commandArguments, 0) ?? '',
    target,
    signal,
    output,
  });
  const matches = fields.filter((field) => field.name === fieldName);

  if (matches.length > 1) {
    throw new CliError({
      code: 'AMBIGUOUS_RESOURCE',
      exitCode: EXIT_CODE.USAGE,
      message: `More than one field has the API name ${fieldName} on ${object.namePlural}.`,
    });
  }

  const field = matches[0];

  if (!isDefined(field)) {
    throw new CliError({
      code: 'NOT_FOUND',
      exitCode: EXIT_CODE.NOT_FOUND,
      message: `No field has the API name ${fieldName} on ${object.namePlural}.`,
      hint: `Use an exact API name from twenty metadata field list ${object.namePlural} --all.`,
    });
  }

  const optionRows = getFieldOptions(field);

  return {
    data: { object, field },
    human: [
      `${field.label} (${field.name}) on ${object.namePlural}`,
      formatDetails([
        ['ID', field.id],
        ['Type', field.type],
        ['Owner', formatMetadataOwner(field.owner)],
        ['Active', formatBoolean(field.isActive)],
        ['System', formatBoolean(field.isSystem)],
        ['Nullable', formatBoolean(field.isNullable)],
        ['Unique', formatBoolean(field.isUnique)],
        ['Default', JSON.stringify(field.defaultValue ?? null)],
      ]),
      field.description ?? '',
      formatMetadataRelations(field),
      isNonEmptyArray(optionRows)
        ? formatTable({
            rows: optionRows,
            columns: [
              {
                header: 'OPTION',
                value: (option) => String(option.label ?? ''),
              },
              {
                header: 'VALUE',
                value: (option) => String(option.value ?? ''),
              },
              {
                header: 'COLOR',
                value: (option) => String(option.color ?? ''),
              },
            ],
          })
        : '',
    ]
      .filter(isNonEmptyString)
      .join('\n\n'),
  };
};
