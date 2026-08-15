use tauri::{Manager, WebviewWindow};
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_notification::NotificationExt;
use url::Url;

const DEPLOY_ORIGIN: &str = "https://travis-twenty.fly.dev";

fn focus_main(window: &WebviewWindow) {
    let _ = window.unminimize();
    let _ = window.show();
    let _ = window.set_focus();
}

fn deploy_url_from_deep_link(raw: &str) -> Option<String> {
    let parsed = Url::parse(raw).ok()?;
    if parsed.scheme() != "twenty" {
        return None;
    }

    let host = parsed.host_str().unwrap_or("");
    let path = parsed.path().trim_start_matches('/');
    let remainder = if host.is_empty() {
        path.to_string()
    } else if path.is_empty() {
        host.to_string()
    } else {
        format!("{host}/{path}")
    };

    let remainder = remainder.trim_start_matches('/');
    if remainder.is_empty() {
        return Some(format!("{DEPLOY_ORIGIN}/"));
    }

    Some(format!("{DEPLOY_ORIGIN}/{remainder}"))
}

fn open_deploy_url(app: &tauri::AppHandle, dest: &str) {
    if let Some(window) = app.get_webview_window("main") {
        if let Ok(encoded) = serde_json::to_string(dest) {
            let _ = window.eval(&format!("window.location.assign({encoded})"));
        }
        focus_main(&window);
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_deep_link::init());

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                focus_main(&window);
            }
        }));
    }

    builder
        .setup(|app| {
            #[cfg(desktop)]
            {
                use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
                use tauri_plugin_global_shortcut::{
                    Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState,
                };

                let reload = MenuItem::with_id(app, "reload", "Reload", true, Some("CmdOrCtrl+R"))?;
                let menu = Menu::with_items(
                    app,
                    &[
                        &Submenu::with_items(
                            app,
                            "Twenty",
                            true,
                            &[
                                &PredefinedMenuItem::about(app, None, None)?,
                                &PredefinedMenuItem::separator(app)?,
                                &PredefinedMenuItem::hide(app, None)?,
                                &PredefinedMenuItem::hide_others(app, None)?,
                                &PredefinedMenuItem::show_all(app, None)?,
                                &PredefinedMenuItem::separator(app)?,
                                &PredefinedMenuItem::quit(app, None)?,
                            ],
                        )?,
                        &Submenu::with_items(app, "View", true, &[&reload])?,
                    ],
                )?;
                app.set_menu(menu)?;
                app.on_menu_event(|app, event| {
                    if event.id().as_ref() == "reload" {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.eval("window.location.reload()");
                        }
                    }
                });

                let focus_shortcut = Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyT);
                let ctrl_focus_shortcut =
                    Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyT);
                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |app, shortcut, event| {
                            if event.state() != ShortcutState::Pressed {
                                return;
                            }
                            if shortcut == &focus_shortcut || shortcut == &ctrl_focus_shortcut {
                                if let Some(window) = app.get_webview_window("main") {
                                    focus_main(&window);
                                }
                            }
                        })
                        .build(),
                )?;
                let _ = app.global_shortcut().register(focus_shortcut);
                let _ = app.global_shortcut().register(ctrl_focus_shortcut);
            }

            let handle = app.handle().clone();
            if let Ok(Some(urls)) = app.deep_link().get_current() {
                if let Some(dest) = urls.iter().find_map(|url| deploy_url_from_deep_link(url.as_str()))
                {
                    open_deploy_url(&handle, &dest);
                }
            }
            app.deep_link().on_open_url(move |event| {
                if let Some(dest) = event
                    .urls()
                    .iter()
                    .find_map(|url| deploy_url_from_deep_link(url.as_str()))
                {
                    open_deploy_url(&handle, &dest);
                }
            });

            let _ = app.notification().request_permission();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running twenty-desktop");
}

#[cfg(test)]
mod tests {
    use super::deploy_url_from_deep_link;

    #[test]
    fn maps_host_style_record_link() {
        assert_eq!(
            deploy_url_from_deep_link("twenty://object/task/abc-123").as_deref(),
            Some("https://travis-twenty.fly.dev/object/task/abc-123")
        );
    }

    #[test]
    fn maps_path_style_record_link() {
        assert_eq!(
            deploy_url_from_deep_link("twenty:///object/habit/xyz").as_deref(),
            Some("https://travis-twenty.fly.dev/object/habit/xyz")
        );
    }
}
