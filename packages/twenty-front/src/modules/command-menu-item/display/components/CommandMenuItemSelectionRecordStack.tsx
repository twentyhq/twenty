import { styled } from '@linaria/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SidePanelContextRecordChipAvatars } from '@/side-panel/components/SidePanelContextRecordChipAvatars';

// Card offsets in the 24px icon column for 1, 2 and 3 cards, front card first.
const CARD_POSITIONS_BY_RECORD_COUNT = [
  [],
  [{ x: 4, y: 4 }],
  [
    { x: 1, y: 7 },
    { x: 7, y: 1 },
  ],
  [
    { x: 0, y: 8 },
    { x: 9, y: 4 },
    { x: 2, y: 0 },
  ],
];

const FRONT_CARD_Z_INDEX = 3;
const DROP_DISTANCE_IN_PX = 6;
const DROP_SCALE = 1.25;
const HIDDEN_SCALE = 0.8;
const OPENING_STAGGER_IN_SECONDS = 0.04;
const EASE_OUT = [0.2, 0, 0, 1] as const;

const StyledStack = styled.div`
  height: ${themeCssVariables.spacing[6]};
  position: relative;
  width: ${themeCssVariables.spacing[6]};
`;

const StyledCardBase = styled.div`
  left: 0;
  position: absolute;
  top: 0;
`;

const StyledCard = motion.create(StyledCardBase);

type CommandMenuItemSelectionRecordStackProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  records: ObjectRecord[];
};

// Records are ordered oldest first, so the latest selection is the front card.
export const CommandMenuItemSelectionRecordStack = ({
  objectMetadataItem,
  records,
}: CommandMenuItemSelectionRecordStackProps) => {
  const theme = useTheme();

  const [recordIdsShownOnOpen] = useState(() =>
    records.map((record) => record.id),
  );
  const [isOpening, setIsOpening] = useState(true);

  const duration = theme.animation.duration.fast;
  const cardPositions = CARD_POSITIONS_BY_RECORD_COUNT[records.length] ?? [];

  return (
    <StyledStack>
      <AnimatePresence>
        {records.map((record, index) => {
          const depth = records.length - 1 - index;
          const position = cardPositions[depth];

          if (!isDefined(position)) {
            return null;
          }

          const isFrontCard = depth === 0;
          const isShownOnOpen = recordIdsShownOnOpen.includes(record.id);
          const zIndex = FRONT_CARD_Z_INDEX - depth;

          // New selections land on the stack; older ones come back in behind it.
          const initial =
            isShownOnOpen || isFrontCard
              ? {
                  opacity: 0,
                  x: position.x,
                  y: position.y - DROP_DISTANCE_IN_PX,
                  scale: DROP_SCALE,
                  zIndex,
                }
              : {
                  opacity: 0,
                  x: position.x,
                  y: position.y,
                  scale: HIDDEN_SCALE,
                  zIndex,
                };

          return (
            <StyledCard
              key={record.id}
              initial={initial}
              animate={{
                opacity: 1,
                x: position.x,
                y: position.y,
                scale: 1,
                zIndex,
              }}
              exit={{
                opacity: 0,
                scale: HIDDEN_SCALE,
                zIndex: 0,
                transition: {
                  duration,
                  ease: EASE_OUT,
                  zIndex: { duration: 0 },
                },
              }}
              transition={{
                duration,
                ease: EASE_OUT,
                delay:
                  isOpening && isShownOnOpen
                    ? index * OPENING_STAGGER_IN_SECONDS
                    : 0,
                zIndex: { duration: 0 },
              }}
              onAnimationComplete={
                isOpening && isFrontCard ? () => setIsOpening(false) : undefined
              }
            >
              <SidePanelContextRecordChipAvatars
                objectMetadataItem={objectMetadataItem}
                record={record}
                borderColor={themeCssVariables.background.primary}
              />
            </StyledCard>
          );
        })}
      </AnimatePresence>
    </StyledStack>
  );
};
