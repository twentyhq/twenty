import EditableCell from '../EditableCell';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';

const component = {
  title: 'EditableCell',
  component: EditableCell,
};

export default component;

type OwnProps = {
  changeHandler: () => void;
};

export const RegularEditableCell = ({ changeHandler }: OwnProps) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <div data-testid="content-editable-parent">
        <EditableCell content={''} changeHandler={changeHandler} />,
      </div>
    </ThemeProvider>
  );
};
