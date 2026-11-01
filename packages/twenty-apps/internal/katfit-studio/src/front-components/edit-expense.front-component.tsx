import { defineFrontComponent } from 'twenty-sdk/define';
import { useSelectedRecordIds } from 'twenty-sdk/front-component';
import { ExpenseForm } from 'src/front-components/components/expense-form';

export const EDIT_EXPENSE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'b887c4ab-9f90-4d6c-9759-5c0cbe6e15fd';

const EditExpense = () => {
  const selectedRecordIds = useSelectedRecordIds();
  const expenseId =
    selectedRecordIds.length === 1 ? selectedRecordIds[0] : undefined;
  return (
    <ExpenseForm
      key={expenseId ?? 'invalid-selection'}
      expenseId={expenseId}
      invalidSelection={expenseId === undefined}
    />
  );
};

export default defineFrontComponent({
  universalIdentifier: EDIT_EXPENSE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'edit-expense',
  description: 'Редактировать выбранный расход без создания новой записи.',
  component: EditExpense,
});
