import { Modal } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

export const StyledSubscriptionModal = styled(Modal)`
  height: auto;
`;

export const StyledPreviewRow = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
`;

export const StyledPreviewLabel = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const StyledActivatedBy = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

export const StyledModalFooter = styled(Modal.Footer)`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
`;

export const StyledFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const StyledWarning = styled.div`
  background: ${({ theme }) => theme.tag.background.orange};
  border-left: 3px solid ${({ theme }) => theme.tag.text.orange};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
`;

export const StyledError = styled.div`
  background: ${({ theme }) => theme.tag.background.red};
  border-left: 3px solid ${({ theme }) => theme.tag.text.red};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
`;

export const formatDate = (date: Date | null): string => {
  if (!isDefined(date)) {
    return 'Not set';
  }

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const buildTargetFieldName = (objectNameSingular: string): string =>
  'target' +
  objectNameSingular.charAt(0).toUpperCase() +
  objectNameSingular.slice(1) +
  'Id';
