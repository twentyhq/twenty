import { useAvailableScopeIdOrThrow } from "@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId";
import { scrollLeftComponentState } from "@/ui/utilities/scroll/states/scrollLeftComponentState";
import { scrollTopComponentState } from "@/ui/utilities/scroll/states/scrollTopComponentState";
import { extractComponentState } from "@/ui/utilities/state/component-state/utils/extractComponentState"
import { ViewScopeInternalContext } from "@/views/scopes/scope-internal-context/ViewScopeInternalContext";

export const useScrollStates = (scrollWrapperId?:string) => {
    const componentId = useAvailableScopeIdOrThrow(
        ViewScopeInternalContext,
        scrollWrapperId,
      );

    return{
        scrollLeftState: extractComponentState(
            scrollLeftComponentState,
            componentId
        ),
        scrollTopState: extractComponentState(
            scrollTopComponentState,
            componentId
        )
    }
}