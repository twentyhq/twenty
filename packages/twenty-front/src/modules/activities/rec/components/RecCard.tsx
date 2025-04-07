import styled from '@emotion/styled';

import { ActivityTargetsInlineCell } from '@/activities/inline-cell/components/ActivityTargetsInlineCell';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldContextProvider } from '@/object-record/record-field/components/FieldContextProvider';
import { H3Title } from 'twenty-ui';
import hondaCar from '../images/black-honda-civic.jpeg';
import subaruCar from '../images/blue-subaru-forester.jpeg';

const StyledCard = styled.div<{ isSingleNote: boolean }>`
  align-items: flex-start;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  height: 300px;
  justify-content: space-between;
  max-width: ${({ isSingleNote }) => (isSingleNote ? '300px' : 'unset')};
`;

const StyledCardDetailsContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  height: calc(100% - 45px);
  justify-content: start;
  padding: ${({ theme }) => theme.spacing(4)};
  width: calc(100% - ${({ theme }) => theme.spacing(8)});
  box-sizing: border-box;
`;

// const StyledNoteTitle = styled.div`
//   color: ${({ theme }) => theme.font.color.primary};
//   font-weight: ${({ theme }) => theme.font.weight.medium};
// `;

const StyledCardContent = styled.div`
  align-self: stretch;
  color: ${({ theme }) => theme.font.color.secondary};
  line-break: anywhere;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-line;
  width: 100%;
`;

const StyledFooter = styled.div`
  align-items: center;
  align-self: stretch;
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2)};
  width: calc(100% - ${({ theme }) => theme.spacing(4)});
`;

const StyledYear = styled.span`
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledTitleContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

interface ImageProps {
  altText?: string;
}

export const RecCard = ({
  record,
  isSingleNote,
}: {
  record: any;
  isSingleNote: boolean;
}) => {
  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const ImageComponent: React.FC<ImageProps> = ({ altText = 'Image' }) => {
    return (
      <img
        src={record.make && record.make === 'Honda' ? hondaCar : subaruCar}
        alt={altText}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    );
  };

  return (
    <StyledCard isSingleNote={isSingleNote}>
      <StyledCardDetailsContainer
        onClick={() =>
          openRecordInCommandMenu({
            recordId: record.id,
            objectNameSingular: CoreObjectNameSingular.Vehicle,
          })
        }
      >
        <StyledTitleContainer>
          <H3Title
            title={
              <>
                {record.name}
                {
                  <StyledYear>
                    {' '}
                    {record.make} {record.model}
                  </StyledYear>
                }
              </>
            }
          />
        </StyledTitleContainer>
        <StyledCardContent>
          <ImageComponent />
        </StyledCardContent>
      </StyledCardDetailsContainer>
      <StyledFooter>
        <FieldContextProvider
          objectNameSingular={CoreObjectNameSingular.Vehicle}
          objectRecordId={record.id}
          fieldMetadataName={'noteTargets'}
          fieldPosition={0}
        >
          <ActivityTargetsInlineCell
            componentInstanceId={`rec-card-${record.id}-targets`}
            activityRecordId={record.id}
            activityObjectNameSingular={CoreObjectNameSingular.Note}
          />
        </FieldContextProvider>
      </StyledFooter>
    </StyledCard>
  );
};
