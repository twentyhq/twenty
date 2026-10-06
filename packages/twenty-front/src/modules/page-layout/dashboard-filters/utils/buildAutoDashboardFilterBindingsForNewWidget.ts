import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { autoBindDashboardFilterSlotToWidget } from '@/page-layout/dashboard-filters/utils/autoBindDashboardFilterSlotToWidget';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  type DashboardFilterBindingsBySlotId,
  type DashboardFilterSlot,
} from 'twenty-shared/types';

export const buildAutoDashboardFilterBindingsForNewWidget = ({
  slots,
  widgetObjectMetadataId,
  existingWidgets,
  objectMetadataItems,
}: {
  slots: DashboardFilterSlot[];
  widgetObjectMetadataId: string | null | undefined;
  existingWidgets: PageLayoutWidget[];
  objectMetadataItems: Pick<EnrichedObjectMetadataItem, 'id' | 'fields'>[];
}): DashboardFilterBindingsBySlotId =>
  Object.fromEntries(
    slots.map((slot) => [
      slot.id,
      autoBindDashboardFilterSlotToWidget({
        slot,
        widgetObjectMetadataId,
        existingWidgets,
        objectMetadataItems,
      }),
    ]),
  );
