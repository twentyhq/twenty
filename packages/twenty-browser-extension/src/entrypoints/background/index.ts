import { onMessage } from "@/utils/messaging";

export default defineBackground(() => {
    onMessage('openPopup', async () => {
        await browser.action.openPopup();
    })
})
