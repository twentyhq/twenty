import { useMutation, useQuery } from '@apollo/client/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { PermissionFlagType } from 'twenty-shared/constants';
import { Callout } from 'twenty-ui/components/feedback';
import { IconInfoCircle } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { useCanSendAiChatMessage } from '@/ai-chat/composer/hooks/useCanSendAiChatMessage';
import { useOpenAskAiPageWithPreprompt } from '@/ai-chat/hooks/useOpenAskAiPageWithPreprompt';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { buildSuggestedViewFieldsAiPrompt } from '@/settings/applications/utils/buildSuggestedViewFieldsAiPrompt';
import { computeSuggestedViewFieldGroups } from '@/settings/applications/utils/computeSuggestedViewFieldGroups';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsByIdMapSelector } from '@/views/states/selectors/viewsByIdMapSelector';
import {
  DismissApplicationSuggestedViewFieldsDocument,
  FindApplicationSuggestedViewFieldsDocument,
} from '~/generated-metadata/graphql';

type SettingsApplicationSuggestedViewFieldsBannerProps = {
  applicationId: string;
  applicationName: string;
};

export const SettingsApplicationSuggestedViewFieldsBanner = ({
  applicationId,
  applicationName,
}: SettingsApplicationSuggestedViewFieldsBannerProps) => {
  const { t } = useLingui();
  const [isHidden, setIsHidden] = useState(false);
  const { data } = useQuery(FindApplicationSuggestedViewFieldsDocument, {
    variables: { applicationId },
    fetchPolicy: 'cache-and-network',
  });
  const [dismissApplicationSuggestedViewFields] = useMutation(
    DismissApplicationSuggestedViewFieldsDocument,
  );
  const { objectMetadataItems } = useObjectMetadataItems();
  const viewsByIdMap = useAtomStateValue(viewsByIdMapSelector);
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const canSendAiChatMessage = useCanSendAiChatMessage();
  const { openAskAiPageWithPreprompt } = useOpenAskAiPageWithPreprompt();

  const suggestedViewFields = data?.applicationSuggestedViewFields ?? [];
  const suggestedViewFieldGroups = computeSuggestedViewFieldGroups({
    suggestedViewFields,
    objectMetadataItems,
    viewsById: viewsByIdMap,
  });
  const suggestedFieldCount = suggestedViewFieldGroups.reduce(
    (fieldCount, { fields }) => fieldCount + fields.length,
    0,
  );

  if (isHidden || suggestedFieldCount === 0) {
    return null;
  }

  const canAskAi = hasAiPermission && canSendAiChatMessage;

  const handleDismiss = () => {
    setIsHidden(true);

    void dismissApplicationSuggestedViewFields({
      variables: {
        input: {
          applicationId,
          universalIdentifiers: suggestedViewFields.map(
            ({ universalIdentifier }) => universalIdentifier,
          ),
        },
      },
    });
  };

  const handleReview = () => {
    setIsHidden(true);

    void openAskAiPageWithPreprompt({
      serializedDocument: serializePlainTextAsAdvancedTextEditorDocument(
        buildSuggestedViewFieldsAiPrompt({
          applicationName,
          suggestedViewFieldGroups,
        }),
      ),
      mode: 'SEND',
    });
  };

  return (
    <Callout
      status="info"
      icon={
        <IconInfoCircle
          size={themeCssVariables.icon.size.md}
          aria-hidden="true"
        />
      }
      title={plural(suggestedFieldCount, {
        one: `${applicationName} suggests # field that is not in your views yet.`,
        other: `${applicationName} suggests # fields that are not in your views yet.`,
      })}
      description={
        canAskAi ? undefined : (
          <>
            {suggestedViewFieldGroups.map(({ viewId, viewName, fields }) => {
              const fieldLabels = fields.map(({ label }) => label).join(', ');

              return <div key={viewId}>{t`${viewName}: ${fieldLabels}`}</div>;
            })}
            <div>{t`Add them from the Options menu of each view.`}</div>
          </>
        )
      }
      action={
        canAskAi ? (
          <Callout.Action
            type="button"
            onClick={handleReview}
          >{t`Review`}</Callout.Action>
        ) : undefined
      }
      closeLabel={t`Dismiss`}
      onDismiss={handleDismiss}
    />
  );
};
