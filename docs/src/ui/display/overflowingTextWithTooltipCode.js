import { OverflowingTextWithTooltip } from "@/ui/display/tooltip/OverflowingTextWithTooltip";
export const MyComponent = () => {
  const crmTaskDescription =
    "Follow up with client regarding their recent product inquiry. Discuss pricing options, address any concerns, and provide additional product information. Record the details of the conversation in the CRM for future reference.";

  return (
    <>
      <h3>Task: Follow-Up with Client</h3>
      <OverflowingTextWithTooltip text={crmTaskDescription} />
    </>
  );
};
