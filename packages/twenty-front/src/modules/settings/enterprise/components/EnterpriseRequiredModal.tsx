import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/input';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H1Title, H1TitleFontColor } from 'twenty-ui/typography';

export const ENTERPRISE_REQUIRED_MODAL_ID = 'enterprise-required-modal';

const StyledCenteredTitle = styled.div`
  text-align: center;
`;

const StyledSectionContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[6]};
`;

const StyledButtonContainer = styled.div`
  box-sizing: border-box;
  margin-top: ${themeCssVariables.spacing[2]};
`;

export const EnterpriseRequiredModal = () => {
  const { t } = useLingui();
  const { closeModal } = useModal();

  return (
    <ModalStatefulWrapper
      modalInstanceId={ENTERPRISE_REQUIRED_MODAL_ID}
      isClosable={true}
      padding="large"
      onEnter={() => closeModal(ENTERPRISE_REQUIRED_MODAL_ID)}
      dataGloballyPreventClickOutside
      renderInDocumentBody
      smallBorderRadius
      narrowWidth
      autoHeight
    >
      <StyledCenteredTitle>
        <H1Title
          title={t`Enterprise plan required`}
          fontColor={H1TitleFontColor.Primary}
        />
      </StyledCenteredTitle>
      <StyledSectionContainer>
        <Section
          alignment={SectionAlignment.Center}
          fontColor={SectionFontColor.Primary}
        >
          {t`This feature is only available on servers with an Enterprise plan. Contact the admin of your server to upgrade.`}
        </Section>
      </StyledSectionContainer>
      <StyledButtonContainer>
        <Button
          onClick={() => closeModal(ENTERPRISE_REQUIRED_MODAL_ID)}
          variant="secondary"
          title={t`Close`}
          fullWidth
          justify="center"
        />
      </StyledButtonContainer>
    </ModalStatefulWrapper>
  );
};
