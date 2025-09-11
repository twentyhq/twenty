import { DropdownMenuSeparator } from "@/ui/layout/dropdown/components/DropdownMenuSeparator";
import { IconPlus } from "twenty-ui/display";
import { MenuItem } from 'twenty-ui/navigation';


const AddStyleContainer =  {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}

export const ObjectFilterDropdownCreateNewOption = ({name}:{name:string}) => {
  return (
    <>
      <MenuItem text="No results" />
      <DropdownMenuSeparator />
      <MenuItem  text={
        <div style={AddStyleContainer}>
        <IconPlus size={14} />
        Add "{name}" to options
        </div>
      }/>
    </>
  )
}
