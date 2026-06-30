import { useLinksFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useLinksFieldDisplay';
import { LinksDisplay } from '@/ui/field/display/components/LinksDisplay';
import { useLingui } from '@lingui/react/macro';
import React from 'react';
import { FieldMetadataSettingsOnClickAction } from 'twenty-shared/types';

import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const LinksFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useLinksFieldDisplay();
  const { copyToClipboard } = useCopyToClipboard();
  const { t } = useLingui();

  const onClickAction = fieldDefinition.metadata.settings?.clickAction;

  const handleLinkClick = (
    url: string,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    if (onClickAction === FieldMetadataSettingsOnClickAction.COPY) {
      event.preventDefault();
      copyToClipboard(url, t`Link copied to clipboard`);
    }
  };

  return <LinksDisplay value={fieldValue} onLinkClick={handleLinkClick} />;
};
