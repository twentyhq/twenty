import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useId } from 'react';
import { Button, Checkbox } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H1Title, H1TitleFontColor } from 'twenty-ui/typography';

import { FRONT_COMPONENT_EXTERNAL_LINK_MODAL_ID } from '@/front-components/constants/FrontComponentExternalLinkModalId';
import { getExternalLinkDisplayUrl } from '@/front-components/utils/getExternalLinkDisplayUrl';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';

const FRONT_COMPONENT_EXTERNAL_LINK_MODAL_WIDTH = 320;

const StyledCenteredTitle = styled.div`
  text-align: center;

  h2 {
    margin-bottom: 0;
  }
`;

const StyledDestinationUrl = styled.span`
  align-items: center;
  align-self: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.strong};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.primary};
  corner-shape: round;
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.md};
  height: 20px;
  justify-content: center;
  max-width: 100%;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledDestinationUrlText = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTrustOriginRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
`;

const StyledTrustOriginLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
`;

type FrontComponentExternalLinkModalProps = {
  url: string;
  shouldTrustOrigin: boolean;
  onShouldTrustOriginChange: (shouldTrustOrigin: boolean) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export const FrontComponentExternalLinkModal = ({
  url,
  shouldTrustOrigin,
  onShouldTrustOriginChange,
  onConfirm,
  onClose,
}: FrontComponentExternalLinkModalProps) => {
  const { closeModal } = useModal();
  const trustOriginLabelId = useId();

  const handleConfirmClick = () => {
    closeModal(FRONT_COMPONENT_EXTERNAL_LINK_MODAL_ID);
    onConfirm();
  };

  const handleCancelClick = () => {
    closeModal(FRONT_COMPONENT_EXTERNAL_LINK_MODAL_ID);
    onClose();
  };

  return (
    <ModalStatefulWrapper
      modalInstanceId={FRONT_COMPONENT_EXTERNAL_LINK_MODAL_ID}
      onClose={onClose}
      onEnter={handleConfirmClick}
      isClosable={true}
      padding="large"
      gap={6}
      dataGloballyPreventClickOutside
      renderInDocumentBody
      smallBorderRadius
      width={FRONT_COMPONENT_EXTERNAL_LINK_MODAL_WIDTH}
      autoHeight
    >
      <StyledCenteredTitle>
        <H1Title
          title={t`Open external link?`}
          fontColor={H1TitleFontColor.Primary}
        />
      </StyledCenteredTitle>
      <StyledDestinationUrl>
        <StyledDestinationUrlText>
          {getExternalLinkDisplayUrl(url)}
        </StyledDestinationUrlText>
      </StyledDestinationUrl>
      <StyledActions>
        <StyledTrustOriginRow>
          <Checkbox
            checked={shouldTrustOrigin}
            onCheckedChange={onShouldTrustOriginChange}
            aria-labelledby={trustOriginLabelId}
          />
          <StyledTrustOriginLabel
            id={trustOriginLabelId}
            onClick={() => onShouldTrustOriginChange(!shouldTrustOrigin)}
          >
            {t`Always allow links to this domain`}
          </StyledTrustOriginLabel>
        </StyledTrustOriginRow>
        <Button
          onClick={handleCancelClick}
          variant="secondary"
          title={t`Cancel`}
          fullWidth
          justify="center"
          dataTestId="front-component-external-link-modal-cancel-button"
        />
        <Button
          onClick={handleConfirmClick}
          variant="primary"
          accent="blue"
          title={t`Open link`}
          fullWidth
          justify="center"
          dataTestId="front-component-external-link-modal-confirm-button"
        />
      </StyledActions>
    </ModalStatefulWrapper>
  );
};
