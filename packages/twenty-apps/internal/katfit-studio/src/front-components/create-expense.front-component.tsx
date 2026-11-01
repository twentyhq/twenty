import { defineFrontComponent } from 'twenty-sdk/define';
import { ExpenseForm } from 'src/front-components/components/expense-form';

export const CREATE_EXPENSE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '7fb2494a-4bb6-4f2e-8b53-f440127157dc';

const CreateExpense = () => <ExpenseForm />;

export default defineFrontComponent({
  universalIdentifier: CREATE_EXPENSE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'create-expense',
  description: 'Создать расход с проверкой суммы и календарных дат.',
  component: CreateExpense,
});
