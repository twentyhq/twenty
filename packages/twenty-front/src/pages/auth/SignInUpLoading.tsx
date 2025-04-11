import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const StyledContentContainer = styled(motion.div)`
  height: 480px;
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const SignInUpLoading = () => {
  console.log('coucou SignInUpLoading');
  return <StyledContentContainer />;
};
