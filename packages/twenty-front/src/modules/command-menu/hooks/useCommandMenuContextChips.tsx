import { CommandMenuContextRecordChipAvatars } from '@/command-menu/components/CommandMenuContextRecordChipAvatars';
import { useCommandMenuHistory } from '@/command-menu/hooks/useCommandMenuHistory';
import { commandMenuNavigationMorphItemByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsState';
import { commandMenuNavigationRecordsState } from '@/command-menu/states/commandMenuNavigationRecordsState';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

const StyledIconWrapper = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const useCommandMenuContextChips = () => {
  const commandMenuNavigationStack = useRecoilValue(
    commandMenuNavigationStackState,
  );

  const { navigateCommandMenuHistory } = useCommandMenuHistory();

  const theme = useTheme();

  const commandMenuNavigationMorphItemByPage = useRecoilValue(
    commandMenuNavigationMorphItemByPageState,
  );

  const commandMenuNavigationRecords = useRecoilValue(
    commandMenuNavigationRecordsState,
  );

  const contextChips = useMemo(() => {
    const filteredCommandMenuNavigationStack =
      commandMenuNavigationStack.filter(
        (page) => page.page !== CommandMenuPages.Root,
      );

    return filteredCommandMenuNavigationStack
      .map((page, index) => {
        const isLastChip =
          index === filteredCommandMenuNavigationStack.length - 1;

        const isRecordPage = page.page === CommandMenuPages.ViewRecord;

        if (isRecordPage && !isLastChip) {
          const commandMenuNavigationMorphItem =
            commandMenuNavigationMorphItemByPage.get(page.pageId);

          if (!isDefined(commandMenuNavigationMorphItem?.recordId)) {
            return null;
          }

          const objectMetadataItem = commandMenuNavigationRecords.find(
            ({ objectMetadataItem }) =>
              objectMetadataItem.id ===
              commandMenuNavigationMorphItem.objectMetadataId,
          )?.objectMetadataItem;

          const record = commandMenuNavigationRecords.find(
            ({ record }) =>
              record.id === commandMenuNavigationMorphItem.recordId,
          )?.record;

          if (!isDefined(objectMetadataItem) || !isDefined(record)) {
            return null;
          }

          const name = getObjectRecordIdentifier({
            objectMetadataItem,
            record,
          }).name;

          return {
            page,
            Icons: [
              <CommandMenuContextRecordChipAvatars
                objectMetadataItem={objectMetadataItem}
                record={record}
              />,
            ],
            text: name,
            onClick: () => {
              navigateCommandMenuHistory(index);
            },
          };
        }

        return {
          page,
          Icons: isLastChip
            ? [<page.pageIcon size={theme.icon.size.sm} />]
            : [
                <StyledIconWrapper>
                  <page.pageIcon
                    size={theme.icon.size.sm}
                    color={
                      isDefined(page.pageIconColor) &&
                      page.pageIconColor !== 'currentColor'
                        ? page.pageIconColor
                        : theme.font.color.tertiary
                    }
                  />
                </StyledIconWrapper>,
              ],
          text: page.pageTitle,
          onClick: isLastChip
            ? undefined
            : () => {
                navigateCommandMenuHistory(index);
              },
        };
      })
      .filter(isDefined);
  }, [
    commandMenuNavigationMorphItemByPage,
    commandMenuNavigationRecords,
    commandMenuNavigationStack,
    navigateCommandMenuHistory,
    theme.font.color.tertiary,
    theme.icon.size.sm,
  ]);

  return {
    contextChips,
  };
};
