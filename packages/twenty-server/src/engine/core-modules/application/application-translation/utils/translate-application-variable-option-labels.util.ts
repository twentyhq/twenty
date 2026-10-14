import { type ApplicationVariableOption } from 'twenty-shared/application';
import {
  generateMessageId,
  TRANSLATABLE_OPTION_LABEL_CONTEXT_BY_OWNER,
  type TranslatableOptionLabelOwner,
} from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

export const translateApplicationVariableOptionLabels = ({
  owner,
  options,
  applicationCatalog,
}: {
  owner: Exclude<TranslatableOptionLabelOwner, 'fieldMetadata'>;
  options: ApplicationVariableOption[] | null | undefined;
  applicationCatalog: Record<string, string> | undefined;
}): ApplicationVariableOption[] | null | undefined => {
  if (!isDefined(options) || !isDefined(applicationCatalog)) {
    return options;
  }

  const context = TRANSLATABLE_OPTION_LABEL_CONTEXT_BY_OWNER[owner];

  return options.map((option) => ({
    ...option,
    label:
      applicationCatalog[generateMessageId(option.label, context)] ??
      option.label,
  }));
};
