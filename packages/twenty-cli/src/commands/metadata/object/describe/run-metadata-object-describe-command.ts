import { isNonEmptyString } from '@sniptt/guards';

import { readStringArgument } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { formatDataValue } from '@/data/format-data-value';
import { fetchMetadataInspection } from '@/metadata/fetch-metadata-inspection';
import { formatMetadataOwner } from '@/metadata/format-metadata-owner';
import { formatDetails } from '@/output/format-details';

export const runMetadataObjectDescribeCommand: CommandRun<
  TargetCommandContext
> = async ({ arguments: commandArguments, target, signal, output }) => {
  const { object } = await fetchMetadataInspection({
    objectName: readStringArgument(commandArguments, 0) ?? '',
    target,
    signal,
    output,
  });

  return {
    data: { object },
    human: [
      `${object.labelPlural} (${object.namePlural})`,
      formatDetails([
        ['ID', object.id],
        ['API names', `${object.nameSingular} / ${object.namePlural}`],
        ...(isNonEmptyString(object.description)
          ? [
              ['Description', formatDataValue(object.description)] as [
                string,
                string,
              ],
            ]
          : []),
        ['Owner', formatMetadataOwner(object.owner)],
        ['Active', String(object.isActive)],
        ['System', String(object.isSystem)],
        ['Searchable', String(object.isSearchable)],
      ]),
      `Fields: twenty metadata field list ${object.namePlural}`,
    ].join('\n\n'),
  };
};
