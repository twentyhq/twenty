import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';

type AiChatContinuesOnIncludedModelMessageProps = {
  includedModelLabel: string | undefined;
};

export const AiChatContinuesOnIncludedModelMessage = ({
  includedModelLabel,
}: AiChatContinuesOnIncludedModelMessageProps) => {
  const { t } = useLingui();

  return (
    <InlineBanner
      embedded
      color="blue"
      message={
        isDefined(includedModelLabel)
          ? t`Out of credits: your next messages use ${includedModelLabel}.`
          : t`Out of credits: your next messages use the included model.`
      }
    />
  );
};
