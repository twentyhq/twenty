import { isNonEmptyString } from '@sniptt/guards';
import { richTextValueSchema } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { fillLegacyBlockNoteMentionObjectNames } from 'src/database/commands/upgrade-version-command/2-51/utils/fill-legacy-blocknote-mention-object-names.util';
import { transformRichTextValue } from 'src/engine/core-modules/record-transformer/utils/transform-rich-text.util';

export const convertStandaloneRichTextWidgetBodyToTiptap = ({
  configuration,
  objectNameSingularByObjectMetadataId,
}: {
  configuration: unknown;
  objectNameSingularByObjectMetadataId: Map<string, string>;
}): { value: unknown; hasChanged: boolean } => {
  if (!isPlainObject(configuration)) {
    return { value: configuration, hasChanged: false };
  }

  const parsedBody = richTextValueSchema
    .partial()
    .safeParse(configuration.body);

  if (!parsedBody.success || isNonEmptyString(parsedBody.data.tiptap)) {
    return { value: configuration, hasChanged: false };
  }

  const { blocknote } = parsedBody.data;
  const { tiptap, markdown } = transformRichTextValue({
    markdown: parsedBody.data.markdown,
    blocknote: isNonEmptyString(blocknote)
      ? fillLegacyBlockNoteMentionObjectNames({
          serializedBlockNote: blocknote,
          objectNameSingularByObjectMetadataId,
        })
      : blocknote,
  });

  if (!isDefined(tiptap)) {
    return { value: configuration, hasChanged: false };
  }

  return {
    value: { ...configuration, body: { ...parsedBody.data, markdown, tiptap } },
    hasChanged: true,
  };
};
