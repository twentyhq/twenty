import { AdvancedFilterCompositeSubFieldSelectMenu } from '@/object-record/advanced-filter/components/AdvancedFilterCompositeSubFieldSelectMenu';
import { AdvancedFilterFieldSelectMenu } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectMenu';
import { AdvancedFilterRelationTargetFieldSelectMenu } from '@/object-record/advanced-filter/components/AdvancedFilterRelationTargetFieldSelectMenu';
import { Dropdown } from 'twenty-ui/components';

type AdvancedFilterFieldSelectDropdownContentProps = {
  recordFilterId: string;
};

export const AdvancedFilterFieldSelectDropdownContent = ({
  recordFilterId,
}: AdvancedFilterFieldSelectDropdownContentProps) => (
  <>
    <Dropdown.Page id="root">
      <AdvancedFilterFieldSelectMenu recordFilterId={recordFilterId} />
    </Dropdown.Page>
    <Dropdown.Page id="composite">
      <AdvancedFilterCompositeSubFieldSelectMenu
        recordFilterId={recordFilterId}
      />
    </Dropdown.Page>
    <Dropdown.Page id="relation-target">
      <AdvancedFilterRelationTargetFieldSelectMenu
        recordFilterId={recordFilterId}
      />
    </Dropdown.Page>
  </>
);
