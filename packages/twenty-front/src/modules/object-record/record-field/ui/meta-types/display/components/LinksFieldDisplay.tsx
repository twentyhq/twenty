import { useLinksFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useLinksFieldDisplay';
import { LinksDisplay } from '@/ui/field/display/components/LinksDisplay';
import { useLingui } from '@lingui/react/macro';
import React from 'react';
import {
  FieldClickAction,
  type FieldMetadataMultiItemSettings,
} from 'twenty-shared/types';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const LinksFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useLinksFieldDisplay();
  const { copyToClipboard } = useCopyToClipboard();
  const { t } = useLingui();

  const settings = fieldDefinition.metadata
    .settings as FieldMetadataMultiItemSettings | null;
  const clickAction = settings?.clickAction ?? FieldClickAction.OPEN_LINK;

  const handleLinkClick = (
    url: string,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    event.preventDefault();
    copyToClipboard(url, t`Link copied to clipboard`);
  };

  return (
    <LinksDisplay
      value={fieldValue}
      onLinkClick={
        clickAction === FieldClickAction.COPY ? handleLinkClick : undefined
      }
      clickAction={clickAction}
    />
  );
};
