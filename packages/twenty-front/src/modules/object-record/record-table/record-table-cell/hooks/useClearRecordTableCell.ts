import { useScopedHotkeys } from 'react-hotkeys-hook';
import useClearRecordTableCell from './useClearRecordTableCell';

const RecordTableCellSoftFocusMode = () => {
   // Call the useClearRecordTableCell hook
   useClearRecordTableCell();
   // Callback function to clear cell content when backspace or delete keys are pressed
   const handleBackspaceDelete = () => {
     // Logic to clear cell content goes here
     // For example, you can call a function or perform an action to clear the cell content
     clearCellContent();
   };

   useScopedHotkeys(
     ['Backspace', 'Delete'],
     handleBackspaceDelete,
     AppHotkeyScope.CommandMenu,
     [clearCellContent] // Dependencies array
   );

   return (
   );
 };
 export default RecordTableCellSoftFocusMode;
