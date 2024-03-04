import styled from '@emotion/styled';

import { Section } from '@/ui/layout/section/components/Section';

const StyledRecordDetailSection = styled(Section)`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  padding: ${({ theme }) => theme.spacing(3)};
  width: auto;
`;

export { StyledRecordDetailSection as RecordDetailSection };
