import { BrowserRouter as Router } from 'react-router-dom';
import { IconComponent } from 'twenty-ui';

import { EntityChip } from '@/ui/display/chip/components/EntityChip';

export const MyComponent = () => {
  return (
    <Router>
      <EntityChip
        linkToEntity="/entity-link"
        entityId="entityTest"
        name="Entity name"
        pictureUrl=""
        avatarType="rounded"
        variant="regular"
        LeftIcon={IconComponent}
      />
    </Router>
  );
};
