import { BrowserRouter as Router } from 'react-router-dom';
import { EntityChip, IconTwentyStar } from 'twenty-ui';

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
        LeftIcon={IconTwentyStar}
      />
    </Router>
  );
};
