import { styled } from '@linaria/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext, useState } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SidePanelContextRecordChipAvatars } from '@/side-panel/components/SidePanelContextRecordChipAvatars';

const STACK_OFFSET_IN_PX = 3;
const DROP_DISTANCE_IN_PX = 6;
const ENTRY_STAGGER_IN_SECONDS = 0.04;

const StyledStack = styled.div`
  height: ${themeCssVariables.spacing[4]};
  position: relative;
  width: ${themeCssVariables.spacing[4]};
`;

const StyledStackedRecordBase = styled.div`
  left: 0;
  position: absolute;
  top: 0;
`;

const StyledStackedRecord = motion.create(StyledStackedRecordBase);

type CommandMenuItemSelectionRecordStackProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  records: ObjectRecord[];
};

// Records are ordered oldest first, so the latest selection lands on top.
export const CommandMenuItemSelectionRecordStack = ({
  objectMetadataItem,
  records,
}: CommandMenuItemSelectionRecordStackProps) => {
  const { theme } = useContext(ThemeContext);

  const [recordIdsShownOnOpen] = useState(() =>
    records.map((record) => record.id),
  );

  return (
    <StyledStack>
      <AnimatePresence>
        {records.map((record, index) => {
          const depth = records.length - 1 - index;
          const isShownOnOpen = recordIdsShownOnOpen.includes(record.id);

          return (
            <StyledStackedRecord
              key={record.id}
              initial={{
                opacity: 0,
                x: 0,
                y: -DROP_DISTANCE_IN_PX,
                scale: 1.2,
              }}
              animate={{
                opacity: 1,
                x: depth * STACK_OFFSET_IN_PX,
                y: -depth * STACK_OFFSET_IN_PX,
                scale: 1,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: theme.animation.duration.fast,
                ease: 'easeOut',
                delay: isShownOnOpen ? index * ENTRY_STAGGER_IN_SECONDS : 0,
              }}
              style={{ zIndex: index }}
            >
              <SidePanelContextRecordChipAvatars
                objectMetadataItem={objectMetadataItem}
                record={record}
                borderColor={themeCssVariables.background.primary}
              />
            </StyledStackedRecord>
          );
        })}
      </AnimatePresence>
    </StyledStack>
  );
};
