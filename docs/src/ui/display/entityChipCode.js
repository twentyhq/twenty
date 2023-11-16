import { BrowserRouter as Router } from "react-router-dom";
import { EntityChip } from "@/ui/display/chip/components/EntityChip";
import { IconComponent } from "@/ui/display/icon/types/IconComponent";

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
