import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import {
  Breadcrumb,
  type BreadcrumbProps,
} from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { styled } from '@linaria/react';
import { forwardRef } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFullScreenOverlay = styled.div`
  background: ${themeCssVariables.background.noisy};
  bottom: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  width: 100%;
  z-index: ${RootStackingContextZIndices.RootModal};
`;

const StyledFullScreenHeaderContainer = styled.div`
  padding-left: ${themeCssVariables.spacing[3]};
`;

const StyledFullScreenContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-height: 0;
  padding: 0 ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[3]}
    ${themeCssVariables.spacing[3]};

  > * {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    row-gap: ${themeCssVariables.spacing[5]};
  }
`;

type FullScreenModalProps = {
  children: React.ReactNode;
  links: BreadcrumbProps['links'];
  onClose: () => void;
  hasClosePageButton?: boolean;
};

export const FullScreenModal = forwardRef<HTMLDivElement, FullScreenModalProps>(
  ({ children, links, onClose, hasClosePageButton = true }, ref) => {
    return (
      <StyledFullScreenOverlay
        ref={ref}
        data-globally-prevent-click-outside="true"
        tabIndex={-1}
      >
        <StyledFullScreenHeaderContainer>
          <PageHeader
            title={<Breadcrumb links={links} />}
            hasClosePageButton={hasClosePageButton}
            onClosePage={onClose}
          />
        </StyledFullScreenHeaderContainer>
        <StyledFullScreenContent>{children}</StyledFullScreenContent>
      </StyledFullScreenOverlay>
    );
  },
);
