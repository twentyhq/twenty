import styled from '@emotion/styled';
import React from 'react';

import { EnhancedModalLayout } from '@/ui/layout/modal/components/EnhancedModalLayout';

const StyledContent = styled(EnhancedModalLayout.Content)`
  align-items: center;
  justify-content: center;
`;

type AuthModalProps = { children: React.ReactNode };

export const AuthModal = ({ children }: AuthModalProps) => (
  <EnhancedModalLayout padding={'none'} modalVariant="primary">
    <StyledContent>{children}</StyledContent>
  </EnhancedModalLayout>
);
